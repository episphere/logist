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
    dt.pids=tb.slice(1).map(x=>x[0])
    dt.x=tb.slice(1).map(x=>x.slice(1,-1))
    //dt.x=logist.transpose(dt.x.map(x=>x.map(x=>parseInt(x))))
    dt.x=logist.transpose(dt.x)
    dt.y=tb.slice(1).map(x=>x.slice(-1))
    dt.y=dt.y.map(x=>parseInt(x[0]))
    dt.min = dt.x.map(xi=>Math.min(...xi))
    dt.max = dt.x.map(xi=>Math.max(...xi))
    dt.b=dt.cols.slice(1,-1).map(_=>NaN) // initializing
    // alleles
    dt.alleles=[]
    dt.xx=[]
    dt.cols.slice(1,-1).forEach((c,i)=>{
        [...new Set(dt.x[i])].sort().forEach(a=>{
            dt.alleles.push(c+'#'+a)
            dt.xx.push((dt.x[i]).map(x=>(x==a)*1))
        })
    })
    dt.chrs=[...new Set(dt.alleles.map(x=>parseInt(x.match(/^\d+/)[0])))].sort((a,b)=>a>b?1:-1)
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
    h+=`<p>${logist.dt.chrs.length} chromossomes : ${logist.dt.cols.length-2} positions # ${logist.dt.alleles.length} alleles x ${logist.dt.pids.length} outcomes</p>`
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
    td0.textContent=`${logist.dt.chrs.length}:${logist.dt.cols.length-2}#${logist.dt.alleles.length}x${logist.dt.xx[0].length}` //logist.dt.cols[0]
    //td0.style.textAlign='center'
    td0.style.color='darkgreen'
    let th01 = document.createElement('th')
    let y = logist.dt.y
    if(y.length>50){
        y=y.slice(0,50)
        y.push('...')
    }
    th01.textContent=y.join('') // outcome
    tr0.appendChild(th01)
    /*
    const hh = ['min','max','b']
    hh.forEach(x=>{
        let th = document.createElement('th')
        tr0.appendChild(th)
        th.textContent=x
    })
    */
    let alleles = logist.dt.alleles
    let xx = logist.dt.xx
    if(logist.dt.alleles.length>10){
        alleles = logist.dt.alleles.slice(0,10)
        xx = logist.dt.xx.slice(0,10)
        alleles.push('...')
        xx.push(['.','.','.'])
    }
    if(xx[0].length>50){
        xx=xx.map(r=>{
            return r.slice(0,50).concat('...')
        })

    }
    alleles.forEach((x,i)=>{
        let tr = document.createElement('tr')
        tb.appendChild(tr)
        let th = document.createElement('th')
        th.textContent=x
        tr.appendChild(th)
        let td01 = document.createElement('td')
        td01.textContent=xx[i].join('')
        tr.appendChild(td01)
        /*
        hh.forEach(f=>{
            let td = document.createElement('td')
            tr.appendChild(td)
            td.textContent=logist.dt[f][i]
        })
        */
    })
}
