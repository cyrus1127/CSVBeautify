// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === 'report_back') {
        tools.url.targets = ['commonSort','commonList'];
        changeView();
    }
});

function changeView(){
    if( tools.url.isInSupportingRange(document.URL) )
    {
        var curJson = FormDataToJson(document.all[0].outerHTML);
        console.log(curJson);
        JsonToViewObject(curJson);    
    }else{
        console.error( '<!---page not support--->\n' + document.URL +  '\n target not in range of ['+ tools.url.targets +'] ');
    }
}

function FormDataToJson(datastr){
    var json = {};
    
    //data cut
    var cuttedDataStr = tools.getBodyContent(datastr);
    var datas = cuttedDataStr.split("\n");
    var tags = [];
    var targetSplit = ',';
    var targetSplit_dQuote = '"';
    var syble_or = '|';

    for(var row in datas)
    {
        if( row <= 1){
            var key = 'timeStamp'+row;
            json[key] = datas[row];
        }else{
            if( row == 2){//tag
                tags = datas[row].split(targetSplit);
            }else{
                //data by tag
                var rowData = datas[row];
                var rowDataJson = {};
                console.log(tags.length + " >> rowData ? " + rowData);
                
                if( row == datas.length - 1 && tools.url.isGetLinkInCludeTotalNum(document.URL))
                {
                    json['totalNum'] = datas[row];
                }else{
                    for(var ti = 0 ; ti < tags.length ; ti++)
                    {
                        var splitedStr;
                        if(tags[ti] == 108){
                            var datas108 = rowData.split(targetSplit_dQuote);
                            for(var di = 0 ; di < datas108.length ; di++)
                            {
                                if(datas108[di].length > 0)
                                {
                                    splitedStr = datas108[di];
                                    di = datas108.length;
                                }
                            }
                        }else{
                            //normal case
                            if(ti < tags.length-1){
                                splitedStr = tools.cutOnceWith(rowData, targetSplit);
                            }else{
                                splitedStr = rowData;
                            }
                        }

                        //slice with picked text
                        if(ti < tags.length-1){
                            rowData = rowData.slice(splitedStr.length + targetSplit.length , rowData.length);
                        }
                        
                        //second layer
                        if( splitedStr.indexOf(syble_or) > -1 )
                        {
                            var secLayer = splitedStr.split(syble_or);
                            for(var sli = 0 ; sli < secLayer.length ; sli++)
                            {
                                if( secLayer[sli].indexOf(targetSplit) > -1 )
                                {
                                    var thrLayer = secLayer[sli].split(targetSplit);
                                    secLayer[sli] = thrLayer;
                                }
                            }
                            rowDataJson[tags[ti]] = secLayer;
                        }else{
                            rowDataJson[tags[ti]] = splitedStr;
                        }
                    }
                    json[row - 2] = rowDataJson;
                }
            }
        }
              
    }
    return json;
}

function JsonToViewObject(json){
    
    //clean
    var b = document.body;
    b.innerHTML = "";
    
    //create entry
    var entryJSON = document.createElement("ul");
    var prefix = document.createElement('div'); prefix.innerHTML = ("{");
    var suffix = document.createElement('div'); suffix.innerHTML = ("}");
    b.setAttribute("id","entryJson");
    document.body.appendChild(prefix);
    document.body.appendChild(entryJSON);
    document.body.appendChild(suffix);
    
    //add object with json data
    tools.jsonKeyLayer(entryJSON, json);
}

var tools = {
    url:{
        targets:[],
        isInSupportingRange:function(url){
            for( target in tools.url.targets)
            {
                console.log('check target ? ' + tools.url.targets[target]);
                if(url.indexOf(tools.url.targets[target]) > -1)
                    return true;
            }
            return false;
        },
        isGetLinkInCludeTotalNum:function(url){ 
            return (tools.url.isGet(url) ? ( url.indexOf('totalNum') > -1 ? true : false ): false); 
        },
        isGet:function(url){ return ( url.indexOf('?') > -1 ? true : false ); },
    },
    jsonKeyLayer:function(parent, json)
    {
        for(key in json)
        {
            if(Array.isArray(json[key])){
                console.log( " ---------- json["+key+"] is kind of array!" );
                var ulLayer_key = document.createElement("span");
                var ulLayer_sep = document.createTextNode(" : [");
                var suffix = document.createTextNode("],");

                ulLayer_key.innerHTML = key;

                parent.appendChild(ulLayer_key);
                parent.appendChild(ulLayer_sep);
                tools.ArrayLayer(parent, json[key]);
                parent.appendChild(suffix);
            }else if( json[key] != null && typeof json[key] == 'object'){
                console.log(" ---------- json["+key+"] is kind of object");
                var ulLayer = document.createElement("ul");
                var prefix = document.createElement('div'); prefix.innerHTML = ("{");
                var suffix = document.createElement('div'); suffix.innerHTML = ("}");
                var commer = document.createElement('div'); commer.innerHTML = (',');

                ulLayer.setAttribute('id',key);
                tools.jsonKeyLayer(ulLayer,json[key]);

                parent.appendChild(prefix);
                parent.appendChild(ulLayer);
                parent.appendChild(suffix);
                parent.appendChild(commer);
            }else{
                var div_key = document.createElement('span');
                var div_data = document.createElement('span');
                var sep = document.createTextNode(" : ");
                div_key.innerHTML = key;
                div_data.innerHTML = json[key];
                var divGroup = document.createElement('div');

                divGroup.appendChild(div_key);
                divGroup.appendChild(sep);
                divGroup.appendChild(div_data);

                parent.appendChild(divGroup);
            }       
        }
    },   
    ArrayLayer:function(parent, array)
    {
        var layer = document.createElement("ul");
        var prefix = document.createTextNode("[ ");
        var suffix = document.createTextNode(" ],");
        for( var ai = 0 ; ai < array.length ; ai++ )
        {
            if( Array.isArray(array[ai]) )
            {
                tools.ArrayLayer(layer,array[ai]);
            }else{
                var divsp = document.createTextNode(" , ");
                var divGroup = document.createElement('span');
                divGroup.innerHTML = array[ai];

                if( ai == 0 )
                    layer.appendChild(prefix);

                if( ai > 0 )
                    layer.appendChild(divsp);
                layer.appendChild(divGroup);

                if( ai == array.length -1  )
                    layer.appendChild(suffix);
            }
        }
        parent.appendChild(layer);
    },
    cutOnceWith:function(data , cutter)
    {
        var pos = data.indexOf(cutter);
        return data.slice(0 , pos);
    },
    isDataWithStringContent : function(data)
    {
        var pos = data.indexOf('"');
        if(pos > -1)
            return true;

        return false;
    },
    getBodyContent : function(data)
    {
        //remove doc Body tag
        var tagName = 'body';
        var head = tools.getElement(true,tagName);
        var tail = tools.getElement(false, tagName);
        var out =  data.slice( data.indexOf(head) + head.length , data.indexOf(tail) );

        console.log(out);

        return out;
    },
    getDivElement : function(msg){   return tools.getElementByTag(false, 'div' , msg); },
    getBrElement : function(msg){   return tools.getElementByTag(true, 'br' , msg); },
    getElementByTag : function(isSingleTag ,tagName , msg)
    {
        var head = tools.getElement(true , tagName);
        var tail = tools.getElement(false , tagName);   

        if(isSingleTag)
            return msg + head;

        return head + msg + tail;
    },
    getElement : function(isHead, tag)
    {
        var tag_hh = '<',tag_th = '</',tag_t = '>';

        if( isHead )
        {
            return tag_hh + tag + tag_t;
        }

        return tag_th + tag + tag_t;
    },
};