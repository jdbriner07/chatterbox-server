// $(document).ready(app.init);

var app = {
  init: function() {

    var src = 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages/';
    var userName = window.location.search.slice(10);
    var room = {
      'roomname': $('#roomSelect option:selected').text()
    };

    //app.handleUsernameClick
    $('#chats').on('click', '.username', app.handleUsernameClick);

    $('#send .submit').on('submit', app.handleSubmit);

    $('#addroom').click(function(event) {
      event.preventDefault();
      var newRoomName = $('#newroom').val();
      app.renderRoom(JSON.stringify(newRoomName));
      app.fetch(src, {
        'roomname': newRoomName
      });
      $(`#roomSelect option[value=${newRoomName}]`).attr('selected', 'selected');

      $('#newroom').val('');
    });

    $('#send').on('click', function(event) {
      event.preventDefault();
      var message = {
        username: userName,
        text: $('#message').val(),
        roomname: $('#roomSelect option:selected').text()
      };
      app.send(message);
      $('#message').val('');
      room = {
        'roomname': $('#roomSelect option:selected').text()
      };
      setTimeout(function() {
        app.fetch(src, room);
      }, 500);
    });

    $('#roomSelect').on('change', function() {
      room = {
        'roomname': $('#roomSelect option:selected').text()
      };
      app.fetch(src, room);
    });
    

    //setInterval(app.fetch, 5000);
    app.fetch(src, {});
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

  uniqueRooms: {}, 

  fetch: function(source, sortBy) {
    $.ajax({
      url: source,
      type: 'GET',
      data: {
        order: '-createdAt', //'-createdAt', //ADD NEGATIVE LATER
        limit: '100',
        where: sortBy
      },
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Data fetched');
        console.log(data);
        $('#chats').html('');
        var messagesArray = data.results;
        messagesArray.forEach( function(element) {
          var roomName = app.escapeHtml(element.roomname);
          if (!app.uniqueRooms.hasOwnProperty(roomName)) {
            app.uniqueRooms[roomName] = 1;
          }
        });
        for (var room in app.uniqueRooms) {
          app.renderRoom(room);
        }

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
    var username = app.escapeHtml(message.username);
    var mess = app.escapeHtml(message.text);
    var room = app.escapeHtml(message.roomname);
    $('#chats').append( `<p class="chat"> <span class="username"> ${username} </span> ${mess} ${room} </p>` );
    // $('#chats span .username').click(function() {
    //   console.log('clicked!');
    // });
  },

  friend: [],

  renderRoom: function(name) {

    var currentRoomList = []; 
    $('#roomSelect option').each(function() {
      currentRoomList.push($(this).text());
    });
    if (currentRoomList.indexOf(name) === -1) {
      $('#roomSelect').append( `<option value=${name}>${name}</option>`);
    }
  },

  handleUsernameClick: function() {
    console.log('handleUsernameClick');
    app.friend.push($(this).text());
    console.log(app.friend);
  },

  handleSubmit: function(event) {
    event.preventDefault();
  },

  escapeHtml: function(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;  
  }

};

$(document).ready(app.init);

