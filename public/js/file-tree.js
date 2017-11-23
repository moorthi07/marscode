'use strict'
$.fn.fileTree = function(api_url){
    var $curnode=null;
    function _renderTree($node, diretories, files){
        var $newList = $('<ul class="list"></ul>');
        $node.after();

        for(var i in diretories){
            $('<a class="dir"></a>').attr('href', $node.attr('href')+'/'+diretories[i])
                                   .text(diretories[i])
                                   .appendTo($newList);
        }

        for(var j in files){
            $('<a class="file"></a>').attr('href', $node.attr('href')+'/'+files[j])
                                   .text(files[j])
                                   .appendTo($newList);
        }  

        $newList.find('a').wrap('<li>');
        $node.parent().append($newList);
    }

    function _openDir($node){
        $node.parent().addClass('opened'); 
        $.getJSON(api_url+'/'+$node.attr('href'), function(list){
               if(list && list.diretories, list.files) {
                   _renderTree($node, list.diretories, list.files);
               }
        });
    }

    function _closeDir($node){
        $node.parent().removeClass('opened'); 
        $node.parent().find('.list').remove();   
    }

    $(this).on('click', 'a.file', function(){
        event.preventDefault();
        $($curnode).toggleClass("clicked");
        $(this).toggleClass( "clicked" );
        var $node = $(this); 
        $curnode=$(this);

        $.ajax({
            type: 'GET',
            url: api_url+'/'+$node.attr('href'), 
            timeout: 300,
            // context: $('body'),
            success: function(data){ 
            console.log(data);
            var oldModel = editor.getModel();
            var newModel = monaco.editor.createModel(data);
            editor.setModel(newModel);  
            },
            error: function(xhr, type){
              alert('Ajax error!');
              console.log(xhr);
            }
          })  
    });

    
    $(this).on('click', 'a.dir', function(){ 
        event.preventDefault();
        $(this).toggleClass( "clicked" )
        var $node = $(this);

        if($node.parent().hasClass('opened')){
            _closeDir($node);
        }else{
            _openDir($node);
        }
    });

    $('#save').click(function(){
        event.preventDefault(); 
        var $node = $(this);
console.log('editor.getModel', editor.getValue());
console.log('curnode',$curnode);
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: api_url+'/'+ $curnode.attr('href'), 
            data:  editor.getValue() , 
            timeout: 300, 
            success: function(data){ 
            alert('Saved.');
            },
            error: function(xhr, type){
              alert('Ajax error!');
              console.log(xhr);
            }
          })  
       
    });
};

$(function(){
    $('#fileTree').fileTree('http://localhost:8080');
});
