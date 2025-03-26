Module.register("MMM-Message", {

  defaults: {
    updateInterval: 60000, // Update every minute (though Firebase will update in real-time)
    fadeSpeed: 4000,
    maxMessages: 5,
    showDate: true,
    dateFormat: "h:mma [on] ddd Do MMMM",
    // Title configuration
    showTitle: true,
    moduleTitle: "Recent Messages",
    titlePadding: "20px",
    titleSize: "22px",
    // Text size configuration
    headerTextSize: "14px",
    messageTextSize: "20px",
    // Firebase configuration
    firebaseConfig: {
      apiKey: "",
      authDomain: "",
      databaseURL: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: ""
    },

    // Email whitelist with names
    whitelist: [ ],
    // Maximum age of messages in days
    maxMessageAge: 7
  },

  getStyles: function() {
    return ["message.css"];
  },

  // Required scripts
  getScripts: function() {
    return [
      "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js",
      "https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js",
      "moment.js"
    ];
  },

  // Define start sequence
  start: function() {
    Log.info("Starting module: " + this.name);
    this.messages = [];
    this.loaded = false;
    
    // Initialize Firebase with the provided configuration
    if (!window.firebase) {
      Log.error(this.name + ": Firebase library not loaded!");
      return;
    }
    
    firebase.initializeApp(this.config.firebaseConfig);
    this.database = firebase.database();
    
    this.startFetchingMessages();
  },

  // Override dom generator
  getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.className = "message-container";
    
    // Add title if enabled
    if (this.config.showTitle) {
      var titleWrapper = document.createElement("div");
      titleWrapper.className = "message-title-wrapper";
      titleWrapper.style.paddingTop = this.config.titlePadding;
      
      var titleElement = document.createElement("div");
      titleElement.className = "message-title";
      titleElement.style.fontSize = this.config.titleSize;
      titleElement.innerHTML = this.config.moduleTitle;
      
      titleWrapper.appendChild(titleElement);
      wrapper.appendChild(titleWrapper);
    }

    if (!this.loaded) {
      var loadingDiv = document.createElement("div");
      loadingDiv.innerHTML = "Loading messages...";
      loadingDiv.className = "dimmed light small";
      wrapper.appendChild(loadingDiv);
      return wrapper;
    }

    if (this.messages.length === 0) {
      var noMessagesDiv = document.createElement("div"); 
      noMessagesDiv.innerHTML = "No recent messages.";
      noMessagesDiv.className = "dimmed light small";
      wrapper.appendChild(noMessagesDiv);
      return wrapper;
    }

    var messageList = document.createElement("div");
    messageList.className = "message-list";

    for (var i = 0; i < Math.min(this.messages.length, this.config.maxMessages); i++) {
      var message = this.messages[i];
      
      var messageDiv = document.createElement("div");
      messageDiv.className = "message-item";
      
      // Header row with sender and date
      var headerDiv = document.createElement("div");
      headerDiv.className = "message-header";
      headerDiv.style.fontSize = this.config.headerTextSize;
      
      // Determine sender name
      var senderName = "";
      if (message.senderName) {
        senderName = message.senderName;
      } else if (message.email) {
        senderName = message.email;
      } else {
        senderName = "Unknown";
      }
      
      // Format date
      var dateString = "";
      if (message.date) {
        dateString = moment(message.date).format(this.config.dateFormat);
      }
      
      headerDiv.innerHTML = senderName + " at " + dateString;
      
      // Message content
      var contentDiv = document.createElement("div");
      contentDiv.className = "message-content";
      contentDiv.style.fontSize = this.config.messageTextSize;
      contentDiv.innerHTML = message.text;
      
      // Add divider
      var dividerDiv = document.createElement("div");
      dividerDiv.className = "message-divider";
      
      // Add all elements to message div
      messageDiv.appendChild(headerDiv);
      messageDiv.appendChild(contentDiv);
      
      // Add to list
      messageList.appendChild(messageDiv);
      
      // Add divider if not the last message
      if (i < Math.min(this.messages.length, this.config.maxMessages) - 1) {
        messageList.appendChild(dividerDiv);
      }
    }

    wrapper.appendChild(messageList);
    return wrapper;
  },

  // Filter messages based on whitelist and date
  filterMessages: function(messages) {
    var now = moment();
    var cutoffDate = moment().subtract(this.config.maxMessageAge, 'days');
    var useWhitelist = this.config.whitelist && this.config.whitelist.length > 0;
    var whitelistEmails = useWhitelist ? this.config.whitelist.map(entry => entry.email.toLowerCase()) : [];
    var emailToNameMap = {};
    
    // Create a map of email addresses to names if using whitelist
    if (useWhitelist) {
      this.config.whitelist.forEach(function(entry) {
        emailToNameMap[entry.email.toLowerCase()] = entry.name;
      });
    }
    
    return messages.filter(message => {
      // Check date filter first (always applied)
      var messageDate = moment(message.date);
      var isRecent = messageDate.isAfter(cutoffDate);
      if (!isRecent) return false;
      
      // If we're not using a whitelist, accept all recent messages
      if (!useWhitelist) return true;
      
      // If we are using a whitelist, check for email
      if (!message.email && useWhitelist) return false;
      
      // Check if the email is in the whitelist
      var isEmailApproved = whitelistEmails.includes(message.email.toLowerCase());
      
      // Add the sender name to the message object if approved
      if (isEmailApproved) {
        message.senderName = emailToNameMap[message.email.toLowerCase()];
      }
      
      return isEmailApproved;
    });
  },

  // Set up Firebase real-time listener
  startFetchingMessages: function() {
    var self = this;
    
    // Reference to the messages node in the database
    var messagesRef = this.database.ref('messages');
    
    // Order by date (newest first) and get more than we need
    // to ensure we have enough after filtering
    var fetchLimit = this.config.maxMessages * 3;
    
    messagesRef.orderByChild('date').limitToLast(fetchLimit)
      .on('value', function(snapshot) {
        var allMessages = [];
        
        // Firebase returns newest last, so we'll collect them
        snapshot.forEach(function(childSnapshot) {
          allMessages.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        
        // Reverse for newest first
        allMessages.reverse();
        
        // Filter messages based on whitelist and date
        self.messages = self.filterMessages(allMessages);
        
        self.loaded = true;
        self.updateDom(self.config.fadeSpeed);
      }, function(error) {
        Log.error(self.name + ": " + error.message);
      });
  },
  
  // Example of module notification handling
  notificationReceived: function(notification, payload, sender) {
    if (notification === "DOM_OBJECTS_CREATED") {
      // The DOM is fully loaded
    }
  }
});