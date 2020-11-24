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
    //dt.b=dt.cols.slice(1,-1).map(_=>NaN) // initializing
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
        th.innerHTML=`<button style="font-size:small" onclick="logist.vizRegressAllele(${i})">${x}</button>`
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
    h+='<table><tr><td id="dataTd"><textarea id="dataArea" rows="20"></textarea><br><button id="irisPlotBt" onclick="logist.irisPlot()">Plot</button> <button id="irisRegressionBt" onclick="logist.irisRegression()">Regression</button><br><span style="color:black;font-size:x-small">you can edit/paste in your own data</span></td><td id="plotTD"><div id="irisPlotDiv"></div></td></tr></table>'
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
            h+=` <input type="radio" id="${k}Radio" name="speciesVar" class="irisSpecies" onchange="logist.getIrisSelectionData()" value="${k}"checked=true>${k}`
        }else{
            h+=` <input type="radio" id="${k}Radio" name="speciesVar" class="irisSpecies" onchange="logist.getIrisSelectionData()" value="${k}">${k}`
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
    dataArea.value=txt
    logist.irisRegression()
    //logist.irisPlot()
}

logist.irisPlot=(P,div)=>{
    div=div||document.getElementById('irisPlotDiv')
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
    let mm = [Math.min(...x),Math.max(...x)]
    tracePred = {
        x:x,
        y:pred,
        name:'model',
        mode: 'lines'
    }
    if(P){
        let min = Math.min(...x)
        let max = Math.max(...x)
        let n = 200
        let step = (max-min)/n
        tracePred.x = [...Array(n+1)].map((_,i)=>min+step*i)
        tracePred.y = logist.fun(tracePred.x,P)
    }
    traces = [traceObs,tracePred]
    let parmTxt = Ylabel
    if(P){parmTxt=`${Ylabel}<br><span style="font-size:x-small">P=${JSON.stringify(P.map(n=>n.toExponential(4))).replace(/"/g,'')}</span>`}
    Plotly.newPlot(div,traces,{
        width: 500,
        title:parmTxt,
        xaxis:{
            title:Xlabel
        },
        yaxis:{
            title:'y= <span style="font-size:large"><sup>1</sup>/<sub>1+e<sup>P<sub>0</sub>+P<sub>1*</sub>x</sup></sub></span>'
        }
    },{displayModeBar: false})
    return traces
}

logist.irisRegression=function(ta = document.getElementById('dataArea')){
    let dtxt = ta.value.split('\n').map(x=>x.split('\t'))
    let x = []
    let y = []
    dtxt.slice(1).forEach(r=>{
        x.push(parseFloat(r[0]))
        y.push(parseFloat(r[1]))
    })
    /*
    let fun=function(x,P){
        //return P[0]/(1+Math.exp(P[1]*x-P[2]))
        return x.map(xi=>1/(1+Math.exp(P[0]*xi-P[1])))
    }
    */
    let Pini=[Math.random(),Math.random()]
    //let Pini=ta.P||[Math.random(),Math.random()]
    //let Pini=[5,30]
    let P = fminsearch(logist.fun,Pini,x,y,{maxIter:10000,display:false})
    //console.log(P)
    let yp = logist.fun(x,P)
    let txt = dtxt[0].join('\t')
    x.forEach((xi,i)=>{
        txt +=`\n${xi}\t${y[i]}\t${(Math.round(yp[i]*1000)/1000).toString()}`
    })
    ta.P=P
    ta.value=txt
    logist.irisPlot(P)
    return ta
}

logist.fun=function(x,P){
    //return P[0]/(1+Math.exp(P[1]*x-P[2]))
    return x.map(xi=>1/(1+Math.exp(P[0]+(P[1]*xi))))
}

logist.vizRegressAllele=function(i){
    let x = logist.dt.xx[i]
    // populate text area
    let txt = `${logist.dt.alleles[i]}\tcase.vs.control`
    x.forEach((xj,j)=>{
        txt+=`\n${xj}\t${logist.dt.y[j]}\tNaN`
    })
    dataArea.value=txt
    setTimeout(function(){irisRegressionBt.click()},100)
    console.log(logist.dt.alleles[i],{x:x,y:logist.dt.y})

}