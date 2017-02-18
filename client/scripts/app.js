// $(document).ready(app.init);

var app = {
  init: function() {
    //$(user) --> handleUsernameClick()
    var username = window.location.search.slice(10);
    $('.username').on('click', app.handleUsernameClick);
    $('#send .submit').on('submit', app.handleSubmit);

    $('#addroom').click(function(event) {
      event.preventDefault();
      var newRoomName = $('#newroom').val();
      app.renderRoom(newRoomName);
      $('#newroom').val('');
    });

    $('#send').on('click', function(event) {
      event.preventDefault();
      var message = {
        username: username,
        text: $('#message').val(),
        roomname: 'lobby'
      };
      app.send(message);
      $('#message').val('');
      app.fetch();
    });

    setInterval(app.fetch, 5000);
    // app.fetch();
  }, 

  send: function(message) {
    $.ajax({
      url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },

  fetch: function() {
    $.ajax({
      url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages/',
      type: 'GET',
      data: {order: '-createdAt', limit: '20' },
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Data fetched');
        console.log(data);
        $('#chats').html('');
        var messagesArray = data.results;
        messagesArray.forEach( function(element) {
          app.renderMessage(element);
        });
      },
      error: function (data) {
        console.error('chatterbox: Failed to fetch data', data);
      }
    });
  },

  clearMessages: function() {
    $('#chats').html('');
  },

  renderMessage: function(message) {
    $('#chats').append( `<p class="chat"> <span class="username"> ${message.username} </span> ${message.text} ${message.roomname} </p>` );
  },

  renderRoom: function(name) {
    $('#roomSelect').append( `<option value= ${name}>${name}</option>`);
  },

  handleUsernameClick: function() {

  },

  handleSubmit: function(event) {
    event.preventDefault();
  }

};

$(document).ready(app.init);

