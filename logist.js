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
    dt.cols=tb[0]
    dt.rows=tb.slice(1).map(x=>x[0])
    dt.x=tb.slice(1).map(x=>x.slice(1,-1))
    //dt.x=logist.transpose(dt.x.map(x=>x.map(x=>parseInt(x))))
    dt.x=logist.transpose(dt.x)
    dt.y=tb.slice(1).map(x=>x.slice(-1))
    dt.y=dt.y.map(x=>parseInt(x[0]))
    dt.min = dt.x.map(xi=>Math.min(...xi))
    dt.max = dt.x.map(xi=>Math.max(...xi))
    dt.b=dt.cols.slice(1,-1).map(_=>NaN) // initializing
    // aleles
    dt.aleles=[]
    dt.xx=[]
    dt.cols.slice(1,-1).forEach((c,i)=>{
        [...new Set(dt.x[i])].sort().forEach(a=>{
            dt.aleles.push(c+'#'+a)
            dt.xx.push((dt.x[i]).map(x=>(x==a)*1))
        })
    })
    return dt
}

logist.transpose=M=>{
    const n = M.length
    const m = M[0].length
    let jj = [...Array(n)].map((_,j)=>j)
    return [...Array(m)].map((_,i)=>{
        return jj.map((_,j)=>{
            return M[j][i]
        })
    })
}

logist.ui=(div='logistDiv')=>{
    if(typeof(div)=='string'){
        div=document.getElementById(div)
    }
    let h = `<p style="color:green">Started: ${Date()}</p>`
    h+='<h2>Logistic regression</h2>'
    h+=`<p>Dataset: ${logist.dt.cols.length-2} variables x ${logist.dt.rows.length} observations</p>`
    h+='<div id="regressionDiv">...</div>'
    div.innerHTML=h
    let divR=document.getElementById('regressionDiv')
    divR.innerHTML=''
    let tb = document.createElement('table')
    divR.appendChild(tb)
    let tr0 = document.createElement('tr')
    tb.appendChild(tr0)
    let td0 = document.createElement('td')
    tr0.appendChild(td0)
    td0.textContent=logist.dt.cols[0]
    td0.style.textAlign='center'
    td0.style.color='darkgreen'
    const hh = ['min','max','b']
    hh.forEach(x=>{
        let th = document.createElement('th')
        tr0.appendChild(th)
        th.textContent=x
    })
    logist.dt.cols.slice(1,-1).forEach((x,i)=>{
        let tr = document.createElement('tr')
        tb.appendChild(tr)
        let th = document.createElement('th')
        th.textContent=x
        tr.appendChild(th)
        hh.forEach(f=>{
            let td = document.createElement('td')
            tr.appendChild(td)
            td.textContent=logist.dt[f][i]
        })
    })
}
