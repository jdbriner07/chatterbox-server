// $(document).ready(app.init);

var app = {
  init: function() {
    //$(user) --> handleUsernameClick()
    $('.username').on('click', app.handleUsernameClick);
    $('#send .submit').on('submit', app.handleSubmit);

    $('#addroom').click(function(event) {
      event.preventDefault();
      var newRoomName = $('#newroom').val();
      app.renderRoom(newRoomName);
    });
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

  fetch: function(source) {
    $.ajax({
      url: source,
      type: 'GET',
      //data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Data fetched');
        console.log(data);
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
    $('#chats').append( `<p class="chat"> <span class="username"> ${message.user} </span> ${message.text} </p>` );
  },

  renderRoom: function(name) {
    console.log(name);
    $('#roomSelect').append( `<option value= ${name}>${name}</option>`);
  },

  handleUsernameClick: function() {

  },

  handleSubmit: function(event) {
    event.preventDefault();
  }

};

$(document).ready(app.init);

