<?php

// Whitelist //////////////////////////////////////////////////////
$origin = $_SERVER['HTTP_ORIGIN'];
$whitelist = ['http://jasons-486.local:5757', 'http://jasonhibbs.co.uk', 'http://pass.wurd.it'];

if (in_array($origin, $whitelist)) {
    header("Access-Control-Allow-Origin: $origin");
}

// Setup //////////////////////////////////////////////////////////
require_once('src/php/words.php');

define('MIN_WORD_LENGTH', 2);
define('MAX_WORD_LENGTH', 9);
define('MIN_PASSWORD_LENGTH', 8);
define('MAX_PASSWORD_LENGTH', 64);
define('DEFAULT_PASSWORD_LENGTH', 24);

function getPasswordLength() {
  $length = DEFAULT_PASSWORD_LENGTH;

  if (isset($_GET['l'])) {
    $getLength = $_GET['l'];

    if ($getLength < MIN_PASSWORD_LENGTH) {
      $getLength = MIN_PASSWORD_LENGTH;
    }

    if ($getLength > MAX_PASSWORD_LENGTH) {
      $getLength = MAX_PASSWORD_LENGTH;
    }

    $length = $getLength;
  }

  return $length;
}

function getPasswordSeparator() {
  $getSeparator = '';

  if (isset($_GET['s'])) {
    $getSeparator = $_GET['s'];
  }

  switch ($getSeparator) {
    case 'n':
      return '0';
    case 's':
      return '/';
    case 'p':
      return '.';
    case 'c':
      return ',';
    default:
      return '-';
  }
}

function getPasswordCase() {
  $case = 'l';

  if (isset($_GET['c'])) {
    $case = $_GET['c'];
  }

  return $case;
}

function deleteAfter($char, $string) {
  $end = substr(strrchr($string, $char), 1);
  $trimlength = strlen($end);
  return substr($string, 0, $trimlength);
}

// Words ----------------------------------------------------------
function getWord($list) {
  global $words;

  if (!$list) {
    $list = $words[rand(0, count($words))];
  }

  return $list[rand(0, count($list))];
}

function getWordOfLength($length) {
  global $words;

  $min = MIN_WORD_LENGTH;
  $max = MAX_WORD_LENGTH;

  if ($length % 1) {
    $length = round($length, 0);
  }

  if ($length < $min) {
    $length = $min;
  }

  if ($length > $max) {
    $length = $max;
  }

  $list = $words[$length - $min];

  return getWord($list);
}

function getWeightedRandomLength() {
  $lengths = [2,3,3,4,4,5,5,5,5,6,6,6,6,6,7,7,7,7,8,8,9];
  return $lengths[rand(0, count($lengths))];
}

function getRandomWord() {
  return getWordOfLength(getWeightedRandomLength());
}

function getPassword($length, $lettercase, $separator) {
  $min = MIN_WORD_LENGTH;
  $max = MAX_WORD_LENGTH;
  $string = '';
  $numbers = ($separator === '0');

  while (strlen($string) < $length) {
    $word = '';

    if ($numbers) {
      $separator = (string) rand(0, 9);
    }

    if (($length - strlen($string)) < ($min + 1)) {
      // We’ve overrun, delete the previous word
      $string = deleteAfter($separator, $string);
    }

    if (($length - strlen($string)) <= $max) {
      if (!strlen($string)) {
        // Password is too short, but we’ll try to give them more than one word
        $word = getWordOfLength( round( ($length / rand(2, 4)) ), 0) . $separator;
      } else {
        // We’re at the end of a string, so we’ll get a word that fits
        $word = getWordOfLength($length - strlen($string));
      }
    } else {
      // Any word will do
      $word = getRandomWord() . $separator;
    }

    if ($lettercase === 'c') {
      $word = ucfirst($word);
    }

    $string .= $word;
  }

  return $string;
}

function thePassword() {
  $l = getPasswordLength();
  $c = getPasswordCase();
  $s = getPasswordSeparator();

  return getPassword($l, $c, $s);
}

echo thePassword();

?>
