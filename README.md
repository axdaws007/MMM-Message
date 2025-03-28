# MMM-Message

A MagicMirror² module to display real-time messages from Firebase.

![Example of MMM-Message](./example_1.png)

This module allows you to display messages from a Firebase Realtime Database on your MagicMirror. Messages are filtered by email whitelist and age, and can be styled to match your mirror's appearance.

## Features

- Real-time message updates using Firebase
- Email whitelist functionality
- Configurable message age limits
- Customizable title and styling
- Displays sender name and timestamp

## Installation

### Prerequisites

You need a Firebase project with Realtime Database set up. You'll need your Firebase configuration details for this module.

### Install

In your terminal, go to your [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) Module folder and clone MMM-Message:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/Dennis-Rosenbaum/MMM-Message.git
```

### Update

```bash
cd ~/MagicMirror/modules/MMM-Message
git pull
```

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:

```js
{
    module: 'MMM-Message',
    position: 'bottom_right',
    config: {
        moduleTitle: "Latest Messages"
    }
}
```

Or with a full configuration:

```js
{
    module: 'MMM-Message',
    position: 'bottom_right',
    config: {
        // Update interval in milliseconds (1 minute)
        updateInterval: 60000,
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
        
        // Firebase configuration (replace with your Firebase project details)
        firebaseConfig: {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
            databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_PROJECT_ID.appspot.com",
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
            appId: "YOUR_APP_ID"
        },
        
        // Email whitelist with names
        whitelist: [
            { email: "person1@example.com", name: "Person One" },
            { email: "person2@example.com", name: "Person Two" }
        ],
        
        // Maximum age of messages in days
        maxMessageAge: 7
    }
}
```

## Configuration options

| Option             | Data type         | Default                 | Description                                                                 |
|--------------------|--------------------|-------------------------|-----------------------------------------------------------------------------|
| `updateInterval`   | `number`           | `60000`                 | Update interval in milliseconds (default: 1 minute)                         |
| `fadeSpeed`        | `number`           | `4000`                  | Speed of the fade animation when updating                                   |
| `maxMessages`      | `number`           | `5`                     | Maximum number of messages to display                                       |
| `showDate`         | `boolean`          | `true`                  | Whether to show the date with each message                                  |
| `dateFormat`       | `string`           | `"h:mma [on] ddd Do MMMM"` | Format for the date/time display (uses Moment.js formatting)            |
| `showTitle`        | `boolean`          | `true`                  | Whether to show the module title                                            |
| `moduleTitle`      | `string`           | `"Recent Messages"`     | Title text to display                                                       |
| `titlePadding`     | `string`           | `"20px"`                | Padding for the title                                                       |
| `titleSize`        | `string`           | `"22px"`                | Font size for the title                                                     |
| `headerTextSize`   | `string`           | `"14px"`                | Font size for the message header (sender name and date)                     |
| `messageTextSize`  | `string`           | `"20px"`                | Font size for the message content                                           |
| `firebaseConfig`   | `object`           | `{}`                    | Firebase configuration object                                               |
| `whitelist`        | `array`            | `[]`                    | Array of objects with `email` and `name` properties for message filtering   |
| `maxMessageAge`    | `number`           | `7`                     | Maximum age of messages to display in days                                  |

## Firebase Database Structure

The module expects your Firebase database to have a structure like:

```
/messages
    /message1
        text: "Hello from Firebase!"
        email: "sender@example.com"
        date: 1647209876543
    /message2
        ...
```

Each message should have:
- `text`: The message content
- `email`: The sender's email address (for filtering via whitelist)
- `date`: Timestamp in milliseconds

## Developer commands

- `npm install` - Install devDependencies like ESLint.
- `npm run lint` - Run linting and formatter checks.
- `npm run lint:fix` - Fix linting and formatter issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.