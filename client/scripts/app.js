var app = {
  init: function() {

    var src = 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages/';
    var userName = window.location.search.slice(10);
    var room = {
      'roomname': $('#roomSelect option:selected').text()
    };

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
      }, 1000);
    });

    $('#roomSelect').on('change', function() {
      var rmn = $('#roomSelect option:selected').text();
      if (rmn === 'All') {
        rmn = {};
      }
      room = {
        'roomname': rmn
      };
      app.clearMessages();
      console.log('room', room);
      app.firstLoad = true;
      app.fetch(src, room);
    });
    

    app.fetch(src, {});
    setInterval(function() {
      app.fetch(src, room);
    }, 1000);
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
  id: '',
  firstLoad: true,
  fetch: function(source, sortBy) {
    $.ajax({
      url: source,
      type: 'GET',
      data: {
        order: '-createdAt', 
        limit: '100',
        where: sortBy
      },
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Data fetched');
        //console.log(data);
        var messagesArray = data.results;

        // Populate a uniqueRooms object to keep track of individual rooms
        messagesArray.forEach( function(element) {
          var roomName = app.escapeHtml(element.roomname);
          if (!app.uniqueRooms.hasOwnProperty(roomName)) {
            app.uniqueRooms[roomName] = 1;
          }
        });

        // Populate room drop down list
        for (var room in app.uniqueRooms) {
          app.renderRoom(room);
        }

        //Populate first load messages
        if (app.firstLoad) {
          for (var i = messagesArray.length - 1; i >= 0; i--) {
            app.renderMessage(messagesArray[i]);
          }
          app.id = messagesArray[0].objectId;
          app.firstLoad = false;

        } else {
          //Populate new messages
          var flagNewMessage = false;
          var sortMessage = _.sortBy(messagesArray, 'createdAt');
          var filterMessage = _.filter(sortMessage, function(element){
            if( flagNewMessage){
              return element;
            }
            if(element.objectId === app.id) { 
              flagNewMessage = true;
            }
          })
          
          filterMessage.forEach( function(element) {
            app.renderMessage(element);
          });
          
          app.id = messagesArray[0].objectId;
        }
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
    var friendClass = '';
    if ( app.friend.indexOf(username) > - 1) {
      friendClass = 'friend';
    } 
    $('#chats').prepend( `<p class="chat"> <span class="username ${friendClass}">${username}</span> ${mess} ${room} </p>` );
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
    var usernameClick = $(this).text();
    if (app.friend.indexOf(usernameClick) === -1) {
      app.friend.push(usernameClick);
    }
    $('.chat .username').each(function() {
      if ( app.friend.indexOf($(this).text()) > -1) {
        $(this).addClass('friend'); 
      } 
    });
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
