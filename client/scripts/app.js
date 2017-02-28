var app = {
  src: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages/',
  username: window.location.search.slice(10),
  uniqueRooms: {}, 
  id: '',
  firstLoad: true,
  friend: [],

  init: function() {
    app.triggerAddRoom();
    app.cancelAddRoom();
    app.addNewRoom();
    app.messagePanelHeader();
    app.filterRoom();
    app.sendMessage();
    app.profilePanel();
    // app.fetchNewMessage();
    
    $('#chats').on('click', '.username', app.handleUsernameClick);

    if( $('#fetch-new-message').attr('numMessage') === 0) {
      $(this).hide();
    }
    
    var roomFilter = {
      order: '-createdAt', 
      limit: '100',
      where: {
        'roomname': $('#roomSelect option:selected').text()
      }
    };

    var noRoomFilter = {
      order: '-createdAt', 
      limit: '100',
    };   
    
    app.fetch(app.src, noRoomFilter);
    
    setInterval(function() {
      app.fetch(app.src, noRoomFilter);
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

  fetch: function(source, sortBy) {
    $.ajax({
      url: source,
      type: 'GET',
      data: sortBy,
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Data fetched');
        //console.log(data);
        var dataArray = data.results;


        //Populate first load messages
        if (app.firstLoad) {
          app.initialLoadMessage(dataArray);

        } else {
          //Populate new messages
          var filterArray = _.filter(dataArray, function(obj) {
            if ( $('#roomSelect option:selected').val() === '{}'){
              return obj;
            } else {
              if(app.escapeHtml(obj.roomname) === $('#roomSelect option:selected').text()) {
              return obj;
              }
            }
          });
          app.clearMessages();
          filterArray.forEach(function(obj) {
            app.renderMessage(obj)
          });
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
    var createTime = app.escapeHtml(message.createdAt);
    var friendClass = '';
    if ( app.friend.indexOf(username) > - 1) {
      friendClass = 'friend';
    } 
    $('#chats').append( `<p class="chat card-block"> <span class="username ${friendClass}">${username}</span><span class="room">${room}</span><span class="create-time">${createTime}</span><span class="message">${mess}</span></p>` );
  },


  renderRoom: function(name) {
    var currentRoomList = [];
    $('#roomSelect option').each(function() {
      currentRoomList.push($(this).text());
    });
    if (currentRoomList.indexOf(name) === -1) {
      $('#roomSelect').append( `<option value=${name}>${name}</option>`);
    }
  },

  initialLoadMessage: function(array) {
    for (var i = array.length - 1; i >= 0; i--) {
      app.renderMessage(array[i]);
    }
    app.loadFilterRoom(array);
    if (array[0] !== undefined ) {
      app.id = array[0].objectId;
    }
    app.firstLoad = false;
  },

  // loadNewMessage: function(array) {
  //   if (array[0] !== undefined ) {
  //     console.log('app id is ', app.id);
  //     app.id = array[0].objectId;
  //   }
  //   var flagNewMessage = false;
  //   var sortMessage = _.sortBy(array, 'createdAt');

  //   var filterMessage = _.filter(sortMessage, function(element){
  //     if( flagNewMessage){
  //       return element;
  //     }
  //     if(element.objectId === app.id) { 
  //      console.log('found same latest ID', element.text);
  //       flagNewMessage = true;
  //     }
  //   });
    
  //   filterMessage.forEach( function(element) {
  //     console.log('passing in elements to be rendered');
  //     app.renderMessage(element);
  //   });

  //   if (array[0] !== undefined ) {
  //     app.id = array[0].objectId;
  //   }
  //   var numNewMessage = filterMessage.length;
  //   var newMessageHtml = `You have ${numNewMessage} new message`;
    
  //   $('#fetch-new-message').text(newMessageHtml);
  //   $('#fetch-new-message').attr('numMessage', numNewMessage);
  //   if (numNewMessage !== 0 ){
  //     $('#fetch-new-message').show();
  //   } else {
  //     $('#fetch-new-message').hide();
  //   }

  // },

  // fetchNewMessage: function() {
  //   $('#fetch-new-message').on('click', function(){
  //     var roomFilter = {
  //       order: '-createdAt', 
  //       limit: '100',
  //       where: {
  //         'roomname': $('#roomSelect option:selected').text()
  //       }
  //     };

  //   if( $('#fetch-new-message').attr('numMessage') === 0) {
  //     console.log('hide');
  //     $('#fetch-new-message').hide();
  //   }

  //   app.fetch(app.src, roomFilter);
    
  //   });
  // },

  sendMessage: function() {
    $('#send .submit').on('submit', app.handleSubmit);
    
    $('#send').on('click', function(event) {
      event.preventDefault();
      
      var message = {
        username: app.username,
        text: $('#message').val(),
        roomname: $('#roomSelect option:selected').text()
      };

      app.send(message);
      
      $('#message').val('');
      
      var roomFilter = {
        order: '-createdAt', 
        limit: '100',
        where: {
          'roomname': $('#roomSelect option:selected').text()
        }
      };
    });
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
  },

  messagePanelHeader: function() {
    var currentRoomName = $('#roomSelect option:selected').text();
    var panelHeading = `<p>Post a message in <span class="current-room">${currentRoomName}</span> room</p>`; 
    $('#main .panel-heading').html(panelHeading);
  },

  profilePanel: function() {
    $('#side .username-title').text(app.username);
  },

  filterRoom: function() {
    $('#roomSelect').on('change', function() {
      app.clearMessages();
      app.firstLoad = true;
      app.messagePanelHeader();
      app.fetch(app.src);
    });
  },

  loadFilterRoom: function(array) {
    array.forEach( function(element) {
      var roomName = app.escapeHtml(element.roomname);
      if (!app.uniqueRooms.hasOwnProperty(roomName)) {
        app.uniqueRooms[roomName] = 1;
      }
    });

    for (var room in app.uniqueRooms) {
      app.renderRoom(room);
    }
  },

  triggerAddRoom: function() {
    $('#trigger-addroom').on('click', function(){
      $('.roomSelect').hide();
      $('#cancel-add-room').show();
      $('#newroom').show();
      $('#addroom').show();
      $('#trigger-addroom').hide();
    });
  },

  cancelAddRoom: function() {
    $('#cancel-add-room').on('click', function(){
      $('#cancel-add-room').hide();
      $('#newroom').val('');
      $('#newroom').hide();
      $('#addroom').hide();
      $('.roomSelect').show();
      $('#trigger-addroom').show();
    });
  },

  addNewRoom: function() {
    $('#addroom').click(function(event) {
      event.preventDefault();

      var newRoomName = $('#newroom').val();
      var roomFilter = {
        order: '-createdAt', 
        limit: '100',
        where: {
          'roomname': newRoomName
        }
      };

      app.renderRoom(app.escapeHtml(newRoomName));
      app.clearMessages();
      app.firstLoad = true;
      app.fetch(app.src, roomFilter);
      
      $(`#roomSelect option[value=${newRoomName}]`).attr('selected', 'selected');
      $('#newroom').val('');
      $('.roomSelect').show();
      $('#cancel-add-room').hide();
      $('#newroom').hide();
      $('#addroom').hide();
      $('#trigger-addroom').show();
      app.messagePanelHeader();
    });
  },


};

$(document).ready(app.init);
