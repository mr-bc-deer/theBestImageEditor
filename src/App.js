import React, { Component } from 'react';

import Controlls from './Controlls';
import Dragzone from './Dragzone';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgSrc: ""
    };
  }

  componentDidMount() {
    if (!localStorage.data) {
      this.loadPlaceholderImage();
    } else if (localStorage.data === null || localStorage.data === "") {
      localStorage.clear();
    } else {
      this.loadImage();
    }
  }

  loadPlaceholderImage = () => {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = require("./assets/photo.png");
    localStorage.setItem("data", img.src);
    img.onload = function(){
      canvas.setAttribute("width", img.width);
      canvas.setAttribute("height", img.height);
        ctx.drawImage(img,0,0);
    }
    this.setState({
      imgSrc: img.src
    });
  }

  loadImage = () => {
    var canvas  = document.getElementById('canvas');
    var img     = new Image();
    var data    = localStorage.getItem("data");

    if (data && data !== "")
    {
      var ctx     = canvas.getContext('2d');
      img.onload = function()
      {
        // scale canvas to image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      img.src = localStorage.data;
    }
  }

  _onChange = (e) => {
    var canvas = document.getElementById('canvas');
    var file = e.target.files[0];

    this.loadCanvas(canvas, file);
  }

  loadCanvas = (canvas, file) => {
    var reader  = new FileReader();
    var ctx = canvas.getContext('2d');
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
          // scale canvas to image
          canvas.width = img.width;
          canvas.height = img.height;
          // draw image
          ctx.drawImage(img, 0, 0
              , canvas.width, canvas.height
          );
          // Get canvas data URL
          try{
            var data = canvas.toDataURL("image/jpeg", 0.7);
            localStorage.setItem("data", data);
          }catch(e){
            console.warn(e);
          }
      }
      img.src = reader.result;
    }
    reader.readAsDataURL(file);
    this.setState({
      imgSrc: localStorage.data
    });
  }

  dataURItoBlob = (dataURI) => {
    // convert base64 to raw binary data held in a string
       var byteString = atob(dataURI.split(',')[1]);

       // separate out the mime component
       var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

       // write the bytes of the string to an ArrayBuffer
       var ab = new ArrayBuffer(byteString.length);
       var ia = new Uint8Array(ab);
       for (var i = 0; i < byteString.length; i++) {
           ia[i] = byteString.charCodeAt(i);
       }

       // write the ArrayBuffer to a blob, and you're done
       var bb = new Blob([ab], {type: mimeString});
       return bb;
  }

  clickBtnSave = (e) => {
    var saveBtn = document.getElementById("saveBtn");
    var canvas = document.getElementById("canvas");
    var canvas2 = document.getElementById("result");
    if(canvas && canvas2) {
      var ctx2 = canvas2.getContext("2d");
      canvas2.setAttribute("width", canvas.width);
      canvas2.setAttribute("height", canvas.height)
      ctx2.filter = localStorage.filterStyle;
      ctx2.drawImage(canvas, 0, 0, canvas.width, canvas.height);
      var data = canvas2.toDataURL("image/jpeg", 1.0);
      var blob = this.dataURItoBlob(data);
      var url = window.URL.createObjectURL(blob);
      saveBtn.href = url;
    }
  }

  clickBtnDel = () => {
    var isOk = window.confirm("Are you sure you want to delete all changes?");
    var res = document.getElementById("result");
    if (isOk && res) {
      res.remove();
      localStorage.clear();
      this.loadPlaceholderImage();
      this.child.setInitState();
      this.child.setDefaultRangePosition();
    }
  }

  clickBtnCan = () => {
    var isOk = window.confirm("Are you sure you want to delete all changes?");
    if (isOk) {
      var myItem = localStorage.getItem("data");
      localStorage.clear();
      localStorage.setItem("data", myItem);
      var canvas = document.getElementById("canvas");
      var result = document.getElementById("result");
      if(canvas && result) {
        const cContext = canvas.getContext('2d');
        const rContext = result.getContext('2d');
        rContext.clearRect(0, 0, canvas.width, canvas.height);
        cContext.filter = "none";
      }
      this.child.setInitState();
      this.child.setDefaultRangePosition();
    }
  }
  render() {
    return (
      <div>
        <header>
          <h1>Image editor</h1>
        </header>
        <div id="upload_zone">
          <input id="file" ref="file" type="file" onChange={this._onChange}/>
          <div className="dragAndDrop">
          </div>
        </div>
        <section>
          <Controlls ref={instance => { this.child = instance; }} />
          <Dragzone upload={this._onChange} />
          <div className="buttons">
            <a id="saveBtn" className="saveBtn" href="#" onClick={this.clickBtnSave} ref="saveBtn" download>Save</a>
            <a className="deleteBtn" href="#" onClick={this.clickBtnDel} >Delete</a>
            <a className="cancelBtn" href="#" onClick={this.clickBtnCan} >Cancel</a>
          </div>
        </section>
        <footer>Made by DM</footer>
      </div>
    );
  }
}

export default App;
