function getdates()
{
var w_array=new Array("星期日","星期一","星期二","星期三","星期四","星期五","星期六");
var d=new Date();
var year=d.getFullYear();
var month=d.getMonth()+1;
var day=d.getDate();
var week=d.getDay();
var h=d.getHours();
var mins=d.getMinutes();
var s=d.getSeconds();
var ss=d.getMilliseconds()
var p='v';

if(month<10) month="0" + month
if(day<10) month="0" + day
if(h<10) h="0" + h
if(mins<10) mins="0" + mins
if(s<10) s="0" + s
if(ss%2===1) p='(O(- -)O)'
else if(ss%2===0) p='(—(- -)—)'

var shows="&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<span>"
 + year + "-" + month + "-" + day + " " + h + ":" + mins +  ":" + s + " " + w_array[week] + "<br>"+p+"&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"+p+"</span>";
document.getElementById("date").innerHTML=shows;
setTimeout("getdates()",100);
}

var h1=document.querySelector('#H');
var h2=document.querySelector('#h');
var click=0;
document.querySelector('#dianwo').onclick = function() {
    if(!click){
    h1.setAttribute('src','images/yanye.gif');
    h2.setAttribute('src','images/yanye2.gif');click=1;}
    else{
        h1.setAttribute('src','images/xiamu.gif');
        h2.setAttribute('src','images/xiamu2.gif');
        click=0;
    }
}
var myButton = document.querySelector('#b2');
var myHeading = document.querySelector('#p0');
function setUserName() {
    var myName = prompt('Please enter your name.');
    localStorage.setItem('name', myName);
    myHeading.textContent = myName;
  }
  if(!localStorage.getItem('name')) {
  } else {
    var storedName = localStorage.getItem('name');
    myHeading.textContent =  storedName;
  }
  myButton.onclick=function(){
      setUserName();
  }