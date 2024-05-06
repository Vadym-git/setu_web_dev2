export class CityDaily {
  // This class like a Model in MVC model - represent API to work with data
  constructor(name, maxT, minT, sunrise, sunset){
    this._name = name;
    this._maxT = maxT;
    this._minT = minT;
    this._sunrise = sunrise;
    this._sunset = sunset;
  }

  name(){
    return this._name;
  }

  maxT(){
    return this._maxT;
  }

  minT(){
    return this._minT;
  }

  sunrise(){
    return this._sunrise;
  }

  sunset(){
    return this._sunset;
  }
}

export class CityHourly {
  constructor(temp, wind){
    this._temp = temp;
    this._wind = wind;
  }
}
