const dreamData = {
  imageStyle: [
    'Realist',
    'Retro',
    'Anime',
    'Graphic Novel',
    'Cartoon',
    'Abstract',
    'Futuristic',
    'Black & White',
  ],
  tense: ['past', 'present', 'future'],
  writingStyle: ['descriptive', 'narrative', 'expository'],
  voice: ['active', 'passive'],
  tone: [
    'optimistic',
    'pessimistic',
    'sarcastic',
    'assertive',
    'aggressive',
    'passionate',
    'entertaining',
    'serious',
    'educational',
    'persuasive',
    'motivating',
    'curious',
    'humoristic',
    'surreal'
  ],
  relationship: ['friends', 'neutral', 'enemies'],
  min_max: ['min', 'standard', 'max'],
  capitalize: (input) => input.charAt(0).toUpperCase() + input.slice(1),
}

export default dreamData;