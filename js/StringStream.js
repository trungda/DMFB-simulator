function StringStream(content) {
  this.mIndex = 0;
  this.mContent = content;
  this.ssparseInt = ssparseInt;
  this.ssparseString = ssparseString;
  this.StringToInt = StringToInt;
  this.clear = clear;
}

function ssparseInt() {
  var ret = 0;
  while (this.mIndex < this.mContent.length) {
    if ('0' <= this.mContent[this.mIndex] && this.mContent[this.mIndex] <= '9') {
      break;
    }
    else this.mIndex ++;
  }
  while (this.mIndex < this.mContent.length) {
    if ('0' <= this.mContent[this.mIndex] && this.mContent[this.mIndex] <= '9') {
      ret = ret * 10 + (this.mContent[this.mIndex] - '0');
      this.mIndex ++;
    }
    else {
      break;
    }
  }
  while (this.mIndex < this.mContent.length && this.mContent[this.mIndex] == ' ') {
    this.mIndex ++;
  }
  return ret;
}

function ssparseString() {
  var ret = "";
  while (this.mIndex < this.mContent.length) {
    if (this.mContent[this.mIndex] != '\n' & this.mContent[this.mIndex] != ' ') {
      break;
    }
    else this.mIndex ++;
  }
  while (this.mIndex < this.mContent.length) {
    if (this.mContent[this.mIndex] != '\n' && this.mContent[this.mIndex] != ' ') {
      ret = ret + this.mContent[this.mIndex];
      this.mIndex ++;
    }
    else {
      break;
    }
  }
  return ret;
}

function StringToInt(s) {
  var ret = 0;
  for (var i = 0; i < s.length; i ++) {
    if ('0' <= s[i] && s[i] <= '9') {
      ret = ret * 10 + (s[i] - '0');
    }
    else {
      return 0;      
    }
  }
  return ret;
}

function clear() {
  mContent = "";
  mIndex = -1;
}