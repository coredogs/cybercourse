var app = app || {};

app.getRandomMessage = function(messageArray) {
   return messageArray[Math.floor(Math.random() * messageArray.length)];
}

var greetings = ['Hello Cai,', 'Hey Cai,', 'Cai,'];

var intro = [
  'I had a look at your solution to the kilos-to-pounds exercise. ',
  'I checked out your work on the kilos-to-pounds exercise. ',
  'About your work on the kilos-to-pounds exercise. '
];

var textEval = [
  [
    'Not that good. Come in for some help. The deets:',
    'You need to improve. Let\'s talk. My ratings:',
    'You can do better. Let\'s talk, see what we can do. My evals:'
  ],
  [
    'Not too bad, but there are some issues. Here\'s how it looks:',
    'Pretty good, though there are things you should fix. The deets:',
    'It\'s OK, but needs fixing. My eval:'
  ],
  [
    'It\'s great! Don\'t change a thing. My ratings:',
    'It\'s really nice. Good work! Here are the deets:',
    'Perfection itself! My eval:'
  ]
];

var sig = [
  'Your Web tech helper,<br>Jesse',
  'Your helping hand,<br>Jesse',
  'Ready to help,<br>Jesse'
];

