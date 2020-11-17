console.log('logist.js loaded')

logist=function(txt){
    //this.txt=txt
    if(txt){
        // parse the tab delited data into a data structure
        logist.dt=logist.parse(txt)
        logist.ui()
    }
}

logist.parse=txt=>{
    const tb = txt.split(/\n/g).map(x=>x.split(/\t/g))
    const dt={}
    // header
    dt.cols=tb[0].slice(1)
    dt.rows=tb.slice(1).map(x=>x[0])
    dt.x=tb.slice(1).map(x=>x.slice(1,-1))
    dt.x=dt.x.map(x=>x.map(x=>parseInt(x)))
    dt.y=tb.slice(1).map(x=>x.slice(-1))
    dt.y=dt.y.map(x=>parseInt(x[0]))
    return dt
}

logist.ui=(div='logistDiv')=>{
    if(typeof(div)=='string'){
        div=document.getElementById(div)
    }
    let h = `<p style="color:green">Started: ${Date()}</p>`
    h+='<h2>Logistic regression</h2>'
    h+=`<p>Dataset: ${logist.dt.cols.length} variables x ${logist.dt.rows.length} observations</p>`
    h+='<div id="regressionDiv">...</div>'
    div.innerHTML=h
}
