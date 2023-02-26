/*BASE METHOD*/
const el=selector=>typeof selector==='string'?(selector.charAt(0)=='#'?document.querySelector(selector):document.querySelectorAll(selector)):selector;
const _el=(element,singlelistener)=>{element=el(element);if(element==null)return null;return element instanceof NodeList?element.forEach(elm=>_el(elm,singlelistener)):singlelistener(element)};
const _tf=(variable,Undefined)=>(variable==undefined?(Undefined||false):(variable===true?true:false))
const css=(element,property,value)=>_el(element,elm=>elm.style[property]=value);
const delcss=(element,property)=>css(element,property,null);
const attr=(element,attribute,value)=>_el(element,elm=>value==undefined?elm.getAttribute(attribute):elm.setAttribute(attribute,value));
const delattr=(element,attribute)=>_el(element,elm=>elm.removeAttribute(attribute));
const _pd=event=>event.preventDefault();

const on=(element,type,listener,remove)=>
_el(element,elm=>{
    let click=event=>{
        if(_tf(remove,false)) elm.removeEventListener(type,click);
        listener(event);
    }
    elm.addEventListener(type,click);   
});

/*TOOLS*/
const c=log=>console.log(log);
const _ready=listener=>{document.addEventListener("DOMContentLoaded",listener);if(document.readyState==="interactive"||document.readyState==="complete")listener();}
const elhtml=(element,html)=>_el(element,elm=>elm.innerHTML=html);
const objmap=(object,callback)=>Object.entries(object).map(([key,value])=>callback(key,value));
const _times={};
const timeStop=(key,time,handler)=>{_times[key]!=undefined?clearTimeout(_times[key]):true;_times[key]=setTimeout(()=>{handler();delete _times[key];},time)};
/*FORM*/
const disabled=(element,value)=>_el(element,elm=>elm.disabled=(value==undefined||value==true?true:false));
const formSubmit=(element,handler)=>on(element,'submit',event=>{_pd(event);handler(event)});
const formReset=(element)=>_el(element,elm=>elm.reset());
const formDisabled=(element,disable)=>['input','select','textarea','button'].forEach(field=>disabled(element+' '+field,disable));
/*HTTP REQUEST*/
const _request={baseurl:'',method:'GET',body:'form',response:'json',query:{},form:null,data:{},headers:{'Accept':'*/*','X-Requested-With':'XMLHttpRequest','Authorization':''},before:()=>true,after:()=>true,success:res=>c(res),error:err=>c(err)};
const request=(endpoint,config={})=>{config.credentials={};config.url=_request.baseurl+endpoint;config.headers={..._request.headers,...config.headers};config.method=(config.method||_request.method).toUpperCase();config.success=config.success||_request.success;config.before=config.before||_request.before;config.after=config.after||_request.after;config.url=config.url+'?'+objmap((config.query||{}),(key,value)=>`${key}=${encodeURIComponent(value)}`).join('&');if(config.method!='GET'){if((config.body||_request.body).toLowerCase()=='json'){config.headers['Accept']='application/json, text/plain, */*';config.headers['Content-Type']='application/json';config.body=JSON.stringify({..._request.data,...(config.data||{})});}else{config.body=(config.form||_request.form)==null?new FormData():new FormData(el(config.form));objmap({..._request.data,...(config.data||{})},(key,value)=>config.body.append(key,value));}config.credentials.body=config.body;}config.credentials={...config.credentials,...{withCredentials:true,credentials:'same-origin',method:config.method,headers:config.headers}};config.response=(config.response||_request.response).toLowerCase();config.before();fetch(config.url,config.credentials).then(res=>{if(!res.ok)throw Error(res.statusText);return res[config.response]()}).then(res=>{config.success(res);config.after();}).catch(err=>{config.error(err);config.after();})}

/*DEVELOPMENT*/
const _close=(selector,delay,handler)=>{
    if(attr(selector,'open')=='true'&&){
        el(selector).classList.remove('open');
        timeStop('close-'+selector,(delay||0),()=>{
            attr(selector,'open',false);
            handler();
        })
    }
}
const _open=(selector,delay,handler)=>{
    if(attr(selector,'open')=='false'){
        attr(selector,'open',true);
        timeStop('open-'+_open,0,()=>{
            el(selector).classList.add('open');
            timeStop('open-'+selector,delay,()=>{
                handler();
            });
        })
    }
}
const modal=eventOpen=>{
    _pd(eventOpen);
    modalswitch=eventOpen.currentTarget;
    selector=attr(modalswitch,'-open')
    delay=parseInt(attr(selector,'-delay')||0);
    _open(selector,delay,()=>{
        // el(selector+' [-close]').addEventListener('click',eventClose=>{
        //     _pd(eventClose);
        //     _close(selector,delay,()=>{
        //         on(modalswitch,'click',modal);
        //     })
        // })
        on(selector+' [-close]','click',eventClose=>{
            _pd(eventClose);
            _close(selector,delay,()=>{
                on(modalswitch,'click',modal);
            },true);
        })
    })
}
on('[-open]','click',modal);