var app = {
  init: function() {

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
      type: 'POST',
      //data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Data fetched');
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
    $('#chats').append( `<p> ${message.text} </p>` );
  },

  renderRoom: function(name) {
    $('#roomSelect').append( `<option value= ${name}>${name}</option>`);
  }
};