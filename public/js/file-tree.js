$.fn.fileTree = function(api_url){
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
        var $node = $(this); 

        $.ajax({
            type: 'GET',
            url: api_url+'/'+$node.attr('href'),
            // data to be added to query string:
            // data: { name: 'Zepto.js' },
            // type of data we are expecting in return:
            // dataType: 'json',
            timeout: 300,
            // context: $('body'),
            success: function(data){
              // Supposing this JSON payload was received:
              //   {"project": {"id": 42, "html": "<div>..." }}
              // append the HTML to context object.
            //   this.append(data.project.html)
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
        var $node = $(this);

        if($node.parent().hasClass('opened')){
            _closeDir($node);
        }else{
            _openDir($node);
        }
    });
};

$(function(){
    $('#fileTree').fileTree('http://localhost:8080');
});
