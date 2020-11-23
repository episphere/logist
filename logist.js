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
    //let h = `<p style="color:green">Started: ${Date()}</p>`
    h='<h2>Data preview</h2>'
    h+=`<p>${logist.dt.chrs.length} chromossomes : ${logist.dt.cols.length-2} positions # ${logist.dt.alleles.length} alleles x ${logist.dt.pids.length} outcomes</p>`
    h+='<div id="dataPreviewDiv">...</div>'
    h+='<h2>Univariate Regression</h2>'
    h+='<div id="univariateRegressionDiv">...</div>'
    h+='<div id="showcaseLogistDiv">...</div>'
    div.innerHTML=h
    let divR=document.getElementById('dataPreviewDiv')
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
    logist.showcaseLogist()
}

logist.showcaseLogist=async(div="showcaseLogistDiv")=>{ // showcase logistic regressions with iris
    if(typeof(div)=='string'){
        div=document.getElementById(div)
    }
    div=div||document.createElement('div')
    if(div.id.length==0){div.id="showcaseLogistDiv"}
    h='<h2>Showcasing logistic regression with the <a href="../ai/data/iris.json" target="_blank">iris dataset</a></h2>'
    h+='<table><tr><td id="dataTd"><textarea id="dataArea" rows="10"></textarea><br><button id="irisPlotBt" onclick="logist.irisPlot()">Plot</button> <button id="irisRegressionBt">Regression</button></td><td id="plotTD"><div id="irisPlotDiv"></div></td></tr></table>'
    // get iris data
    div.iris = await (await fetch('../ai/data/iris.json')).json() 
    div.indVars=Object.keys(div.iris[0]).slice(0,-1)
    div.species=[...new Set(showcaseLogistDiv.iris.map(x=>x.species))]
    h+='<h3>Independent variable</h3>'
    div.indVars.forEach((k,i)=>{
        if(i==0){
            h+=` ${k}:<input type="radio" id="${k}Radio" name="indVar" value="${k}" class="irisVar" onchange="logist.getIrisSelectionData()" checked=true>`
        }else{
            h+=` ${k}:<input type="radio" id="${k}Radio" name="indVar" class="irisVar" onchange="logist.getIrisSelectionData()" value="${k}">`
        }        
    })
    h+='</p>'
    h+='<h3>Classification</h3>'
    h+='Species: '
    div.species.forEach((k,i)=>{
        if(i==0){
            h+=` ${k}:<input type="radio" id="${k}Radio" name="speciesVar" class="irisSpecies" onchange="logist.getIrisSelectionData()" value="${k}"checked=true>`
        }else{
            h+=` ${k}:<input type="radio" id="${k}Radio" name="speciesVar" class="irisSpecies" onchange="logist.getIrisSelectionData()" value="${k}">`
        }
    })
    div.innerHTML=h
    setTimeout(logist.getIrisSelectionData,100)
    return div
}

logist.getIrisSelectionData=(div=document.getElementById("showcaseLogistDiv"))=>{
    //console.log(Date())
    const varName = [...div.getElementsByClassName('irisVar')].filter(x=>x.checked)[0].value
    const className = [...div.getElementsByClassName('irisSpecies')].filter(x=>x.checked)[0].value
    // fill text area
    let txt=`${varName}\t${className}\n`
    // sort array by value of selected variable
    div.iris.sort((a,b)=>{
        if(a[varName]<b[varName]){
            return -1
        }else{
            return 1
        }
    })
    txt += div.iris.map(xy=>[xy[varName],1*(xy.species==className),NaN].join('\t')).join('\n')
    dataArea.textContent=txt
    logist.irisPlot()
}

logist.irisPlot=(div=document.getElementById('irisPlotDiv'))=>{
    // extract data from text area
    let dt = dataArea.value.split('\n').map(x=>x.split('\t'))
    let Xlabel = dt[0][0]
    let Ylabel = dt[0][1]
    let x=[]
    let obs=[]
    let pred=[]
    dt.slice(1).forEach((r,i)=>{
        x.push(parseFloat(r[0]))
        obs.push(parseFloat(r[1]))
        pred.push(parseFloat(r[2]))
    })
    traceObs = {
        x:x,
        y:obs,
        name:'observed',
        mode: 'markers'
    }
    tracePred = {
        x:x,
        y:pred,
        name:'predicted',
        mode: 'lines'
    }
    traces = [traceObs,tracePred]
    Plotly.newPlot(div,traces,{
        width: 500,
        title:Ylabel,
        xaxis:{
            title:Xlabel
        }
    })
    return traces
}
