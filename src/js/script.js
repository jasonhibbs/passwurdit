//@codekit-prepend "plugins.js"
// Script /////////////////////////////////////////////////////////
var minWordLength = 2;
var maxWordLength = 9;
var minPasswordLength = 12;
var maxPasswordLength = 64;
var defaultPasswordLength = 24;

function random(max, min) {
  if (!max) { max = 1 }
  if (!min) { min = 0 }
  var diff = (max - min);
  return Math.floor(Math.random() * diff) + min;
}

function uppercase(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function deleteAfter(char, string) {
  var index = string.slice(0, -1).lastIndexOf(char) + 1;

  if (char.match(/\d/)) {
    index = string.search(/(\d+)(?!.*\d)/) + 1;
  }

  return string.substring(0, index);
}

function getSeparator(code) {
  switch (code) {
    case 'n':
      return '0';
      break;
    case 's':
      return '/';
      break;
    case 'p':
      return '.';
      break;
    case 'c':
      return ',';
      break;
    case 'h':
    default:
      return '-';
      break;
  }
}

// Words ----------------------------------------------------------
function getWord(list) {
  return list[random(list.length)];
}

function getWordOfLength(length) {
  var min = minWordLength;
  var max = maxWordLength;
  var list;

  if (length % 1) {
    length = Math.floor(length);
  }

  if (length < min) {
    length = min;
  }

  if (length > max) {
    length = max;
  }

  list = words[length - min];

  return getWord(list);
}

function getWeightedRandomLength() {
  var lengths = [2,3,4,4,5,5,5,5,6,6,6,7,7,8,9];
  return lengths[random(lengths.length)];
}

function getRandomWord() {
  var min = minWordLength;
  var max = maxWordLength;
  return getWordOfLength(getWeightedRandomLength());
}

function getPassword(length, lettercase, separator) {
  var min = minWordLength;
  var max = maxWordLength;
  var string = '';
  var numbers = false;

  if (!length) { length = defaultPasswordLength; }

  if (separator === 'n') {
    numbers = true;
  } else {
    separator = getSeparator(separator);
  }

  while (string.length < length) {
    var word;

    if (numbers) {
      separator = random(9).toString();
    }

    if ((length - string.length) < (min + 1)) {
      string = deleteAfter(separator, string);
    }

    if ((length - string.length) <= max) {
      word = getWordOfLength(length - string.length);
    } else {
      word = getRandomWord() + separator;
    }

    if (lettercase === 'c') {
      word = uppercase(word);
    }

    string += word;
  }

  return string;
}

// Validate -------------------------------------------------------
function isLengthValid(length) {
  return !length || (length >= minPasswordLength && length <= maxPasswordLength);
}

function validateLength(length) {
  if (!length) {
    return false;
  } else {
    if (length % 1) {
      length = Math.floor(length);
    }

    if (length < minPasswordLength) {
      length = minPasswordLength;
    }

    if (length > maxPasswordLength) {
      length = maxPasswordLength;
    }

    return length;
  }
}

function validateCase(lettercase) {
  if (!lettercase) {
    return false;
  } else {
    var valid = ['c', 'l'];
    if (valid.indexOf(lettercase) > -1) {
      return lettercase;
    } else {
      return 'l';
    }
  }
}

function validateSeparator(separator) {
  if (!separator) {
    return false;
  } else {
    var valid = ['h', 'd', 's', 'n'];
    if (valid.indexOf(separator) > -1) {
      return separator;
    } else {
      return 'h';
    }
  }
}

// URL Code -------------------------------------------------------
function getQueryFromPath(path) {
  var query = {};
  var parts = path.slice(1).split(':');

  if (parts[0]) {
    query.length = validateLength(parts[0]);
  }
  if (parts[1]) {
    query.lettercase = validateCase(parts[1]);
  }
  if (parts[2]) {
    query.separator = validateSeparator(parts[2]);
  }

  return query;
}

// Vue ////////////////////////////////////////////////////////////
var vr = new VueRouter({
  mode: 'history'
});

var vm = new Vue({
  router: vr,
  el: '#app',
  data: {
    refresh : false,
    input: {
      length     : 24,
      lettercase : 'l',
      separator  : 'h'
    },
    settings: {
      length     : 24,
      lettercase : 'l',
      separator  : 'h'
    }
  },
  methods: {
    getQuery: function() {
      this.input.length     = validateLength(this.$route.query.l)    || this.settings.length;
      this.input.lettercase = validateCase(this.$route.query.c)      || this.settings.lettercase;
      this.input.separator  = validateSeparator(this.$route.query.s) || this.settings.separator;
      this.updateSettings();
    },
    getCode: function() {
      if (this.$route.path.length > 1 && this.$route.path[1].match(/\d/)) {
        this.input = Object.assign(this.input, getQueryFromPath(this.$route.path));
      }
      this.updateSettings();
    },
    onInput: function() {
      this.updateSettings();
      this.updateURL();
    },
    updateSettings: function() {
      if (isLengthValid(this.input.length)) {
        this.settings.length   = this.input.length;
      }
      this.settings.lettercase = this.input.lettercase;
      this.settings.separator  = this.input.separator;
    },
    updateURL: function() {
      // this.updateQuery();
      this.updateCode();
    },
    updateQuery: function() {
      this.$router.replace({
        query: {
          l: this.settings.length,
          c: this.settings.lettercase,
          s: this.settings.separator
        }
      });
    },
    updateCode: function() {
      this.$router.replace({
        path: this.urlCode
      });
    },
    updatePassword: function() {
      this.refresh = !this.refresh;
      this.updateURL();
    }
  },
  computed: {
    password: function() {
      var refresh = this.refresh;
      return getPassword(this.settings.length, this.settings.lettercase, this.settings.separator);
    },
    urlCode: function() {
      return this.settings.length + ':' + this.settings.lettercase + ':' + this.settings.separator;
    }
  },
  beforeMount: function() {
    this.getQuery();
    this.getCode();
  }
});

// TODO:
// Address invalid input
