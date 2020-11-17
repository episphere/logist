console.log('logist.js loaded')

logist=function(txt){
    //this.txt=txt
    if(txt){
        logist.dt=logist.parse(txt)
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
