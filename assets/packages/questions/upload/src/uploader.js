import './ajaxupload.js';
import './modaldialog.js';

"use strict"
var uploadHandler = function (qid, options) {

    var init = function () {
        doFileUpload();
    };
    
    var fixParentHeigth = function () {
        return;
    }

    var renderPreviewItem = function (fieldname, item, iterator) {

        var i = iterator;
        var image_extensions = new Array('gif', 'jpeg', 'jpg', 'png', 'swf', 'psd', 'bmp', 'tiff', 'jp2', 'iff', 'bmp', 'xbm', 'ico');
         
        var previewblock = $('<li id="' + fieldname + '_li_' + i + '" class="previewblock file-element"></li>');
        var previewContainer = $('<div class="file-preview"></div>');

        if (isValueInArray(image_extensions, item.ext.toLowerCase())){
            previewContainer.append('<img src="' + options.uploadurl + '/filegetcontents/' + item.filename + '" class="uploaded" />');
        } else {
            previewContainer.append('<div class="upload-placeholder"></div>');
        }

        previewContainer.append('<span class="file-name">' + escapeHtml(decodeURIComponent(item.name)) + '</span>');

        if ($('#' + fieldname + '_show_title').val() == 1 || $('#' + fieldname + '_show_comment').val() == 1) {

            var previewTitleContainer = $('');
            var previewCommentContainer = $('');

            if ($('#' + fieldname + '_show_title').val() == 1) {
                var previewTitleContainer = $('<div class="form-group"></div>');
                $('<label class="control-label col-xs-4"></label>')
                    .attr('for', fieldname + '_title_' + i)
                    .text(options.uploadLang.titleFld)
                    .appendTo(previewTitleContainer);
                $('<input class="form-control" type="text"/>')
                    .attr('id', fieldname + "_title_" + i)
                    .val(item.title)
                    .wrap('<div class="input-container"></div>')
                    .appendTo(previewTitleContainer);
            }

            if ($('#' + fieldname + '_show_comment').val() == 1) {
                var previewCommentContainer = $('<div class="form-group"></div>');
                $('<label class="control-label col-xs-4"></label>')
                    .attr('for', fieldname + '_comment_' + i)
                    .text(options.uploadLang.commentFld)
                    .appendTo(previewCommentContainer);
                $('<input class="form-control" type="text"/>')
                    .attr('id', fieldname + "_comment_" + i)
                    .val(item.comment)
                    .wrap('<div class="input-container"></div>')
                    .appendTo(previewCommentContainer);
            }

        }

        var previewDeleteBlock = $('<div class="form-group"></div>').append(
            $('<a class="btn btn-danger"></a>')
                .html('<span class="fa fa-trash"></span>&nbsp;' + options.uploadLang.deleteFile )
                .on('click', function () {
                    deletefile(fieldname, i);
                })
                .wrap('<div class="input-container text-center"></div>')
        );

        $('<fieldset></fieldset>')
            .append(previewTitleContainer).append(previewCommentContainer).append(previewDeleteBlock)
            .wrap('<div class="file-info"></div>')
            .appendTo(previewContainer);

            
            $('<input type="hidden" />').attr('id', fieldname + '_size_' + i).attr('value', item.size).appendTo(previewblock);
            $('<input type="hidden" />').attr('id', fieldname + '_name_' + i).attr('value', item.name).appendTo(previewblock);
            $('<input type="hidden" />').attr('id', fieldname + '_file_index_' + i).attr('value', i).appendTo(previewblock);
            $('<input type="hidden" />').attr('id', fieldname + '_filename_' + i).attr('value', item.filename).appendTo(previewblock);
            $('<input type="hidden" />').attr('id', fieldname + '_ext_' + i).attr('value', item.ext).appendTo(previewblock);
            
        // add file to the list only if it doesn't exists already
        if ($("#" + fieldname + "_li_" + i).length === 0){
            previewblock.append(previewContainer);
            $('#field' + fieldname + '_listfiles').append(previewblock);
        }
    }

    var doFileUpload = function () {
        var fieldname = options.sFieldName;
        /* Load the previously uploaded files */
        var filecount = $('#' + fieldname + '_filecount').val();

        $('#' + fieldname + '_filecount').val(filecount);

        var image_extensions = ['gif', 'jpeg', 'jpg', 'png', 'swf', 'psd', 'bmp', 'tiff', 'jp2', 'iff', 'bmp', 'xbm', 'ico'];

        if (filecount > 0) {
            var jsontext = $('#' + fieldname).val();

            var json = '';
            try{
                json = JSON.parse(jsontext);
            } catch(e) {}

            if ($('#field' + fieldname + '_listfiles').length == 0) {
                $('<ul id="field' + fieldname + '_listfiles" class="files-list" />').insertAfter('#uploadstatus_' + qid);
            }

            $('#' + fieldname + '_licount').val(filecount);

            json.forEach(function (item, iterator) {
                renderPreviewItem(fieldname, item, iterator+1);
            });
        }

        // The upload button
        var button = $('#button_' + qid);
        new AjaxUpload(button, {
            action: options.uploadurl + '/sid/' + surveyid + '/preview/' + options.questgrppreview + '/fieldname/' + fieldname + '/',
            name: 'uploadfile',
            data: {
                valid_extensions: $('#' + fieldname + '_allowed_filetypes').val(),
                max_filesize: $('#' + fieldname + '_maxfilesize').val(),
                preview: $('#preview').val(),
                surveyid: surveyid,
                fieldname: fieldname,
                YII_CSRF_TOKEN: options.csrfToken
            },
            onSubmit: function (file, ext) {

                var maxfiles = parseInt($('#' + fieldname + '_maxfiles').val());
                var filecount = parseInt($('#' + fieldname + '_filecount').val());
                var allowed_filetypes = $('#' + fieldname + '_allowed_filetypes').val().split(",");
                /* If maximum number of allowed filetypes have already been uploaded,
                 * do not upload the file and display an error message ! */
                if (filecount >= maxfiles) {
                    $('#notice').html('<p class="alert alert-danger"><span class="fa fa-exclamation-circle"></span>&nbsp;' + uploadLang.errorNoMoreFiles + '</p>');
                    fixParentHeigth();
                    return false;
                }

                /* If the file being uploaded is not allowed,
                 * do not upload the file and display an error message!
                 */
                var allowSubmit = allowed_filetypes.reduce(function (col, item) {
                    return col || ext.toLowerCase() === item;
                }, false);


                if (allowSubmit == false) {
                    $('#notice').html('<p class="alert alert-danger"><span class="fa fa-exclamation-circle"></span>&nbsp;' + uploadLang.errorOnlyAllowed.replace('%s', $('#' + fieldname + '_allowed_filetypes').val()) + '</p>');
                    fixParentHeigth();
                    return false;
                }

                // change button text, when user selects file
                button.text(options.uploadLang.uploading);

                // If you want to allow uploading only 1 file at time,
                // you can disable upload button
                this.disable();

                button.append('<i id="loading-icon-fielupload" class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>');

            },
            onComplete: function (file, response) {
                button.text(uploadLang.selectfile);
                $('#loading-icon-fielupload').remove();
                // enable upload button
                this.enable();

                // Once the file has been uploaded via AJAX,
                // the preview is appended to the list of files
                try{
                    var metadata = JSON.parse(response);
                } catch(e) {
                    /* Suppose we get an HTML error ? Replace whole HTML (without head) */
                    $('body').html(response);
                    return;
                }

                var count = parseInt($('#' + fieldname + '_licount').val());
                count++;
                $('#' + fieldname + '_licount').val(count);

                if (metadata.success) {
                    $('#notice').html('<p class="alert alert-success"><span class="fa fa-success"></span>&nbsp;' + metadata.msg + '</p>');
                    if ($('#field' + fieldname + '_listfiles').length == 0) {
                        $("<ul id='field" + fieldname + "_listfiles' class='files-list' />").insertAfter("#uploadstatus_" + options.qid);
                    }
                    renderPreviewItem(fieldname, metadata, count);

                    // var previewblock =  "<li id='"+fieldname+"_li_"+count+"' class='previewblock file-element'>";

                    // previewblock +="<div class='file-preview'>";
                    // if (isValueInArray(image_extensions, metadata.ext.toLowerCase()))
                    //     previewblock += "<img src='"+uploadurl+"/filegetcontents/"+decodeURIComponent(metadata.filename)+"' class='uploaded'  onload='fixParentHeigth()' />";
                    // else
                    //     previewblock += "<div class='upload-placeholder' />";
                    // previewblock += "<span class='file-name'>"+escapeHtml(decodeURIComponent(metadata.name))+"<span>";
                    // previewblock += "</div>";

                    // previewblock +="<div class='file-info'><fieldset>";
                    // if ($('#'+fieldname+'_show_title').val() == 1 || $('#'+fieldname+'_show_comment').val() == 1)
                    // {
                    //     if($('#'+fieldname+'_show_title').val() == 1)
                    //     {
                    //         previewblock += "<div class='form-group'><label class='control-label col-xs-4' for='"+fieldname+"_title_"+count+"'>"+uploadLang.titleFld+"</label>"+"<div class='input-container'><input class='form-control' type='text' value='' id='"+fieldname+"_title_"+count+"' /></div></div>";
                    //     }
                    //     if($('#'+fieldname+'_show_comment').val() == 1)
                    //     {
                    //         previewblock += "<div class='form-group'><label class='control-label col-xs-4' for='"+fieldname+"_comment_"+count+"'>"+uploadLang.commentFld+"</label>"+"<div class='input-container'><input class='form-control' type='text' value='' id='"+fieldname+"_comment_"+count+"' /></div></div>";
                    //     }
                    // }
                    // previewblock += "<div class='form-group'><div class='col-xs-4'></div><div class='input-container'><a class='btn btn-danger' onclick='deletefile(\""+fieldname+"\", "+count+")'><span class='fa fa-trash'></span>&nbsp;"+uploadLang.deleteFile+"</a></div></div>";
                    // previewblock += "</fieldset></div>";

                    // previewblock += "<input type='hidden' id='"+fieldname+"_size_"+count+"' value="+metadata.size+" />"+
                    //                 "<input type='hidden' id='"+fieldname+"_file_index_"+count+"' value="+metadata.file_index+" />"+
                    //                 "<input type='hidden' id='"+fieldname+"_name_"+count+"' value="+metadata.name+" />"+
                    //                 "<input type='hidden' id='"+fieldname+"_filename_"+count+"' value="+metadata.filename+" />"+
                    //                 "<input type='hidden' id='"+fieldname+"_ext_" +count+"' value="+metadata.ext+"  />";

                    // previewblock += "</li>";

                    // // add file to the list
                    // $('#field'+fieldname+'_listfiles').prepend(previewblock);

                    var filecount = parseInt($('#' + fieldname + '_filecount').val());
                    var minfiles = parseInt($('#' + fieldname + '_minfiles').val());
                    filecount++;
                    var maxfiles = parseInt($('#' + fieldname + '_maxfiles').val());
                    $('#' + fieldname + '_filecount').val(filecount);

                    if (filecount < minfiles)
                        $('#uploadstatus').html(options.uploadLang.errorNeedMore.replace('%s', (minfiles - filecount)));
                    else if (filecount < maxfiles)
                        $('#uploadstatus').html(options.uploadLang.errorMoreAllowed.replace('%s', (maxfiles - filecount)));
                    else
                        $('#uploadstatus').html(options.uploadLang.errorMaxReached);
                    fixParentHeigth();
                    if (filecount >= maxfiles)
                        $('#notice').html('<p class="alert alert-success"><span class="fa fa-check"></span>&nbsp;' + options.uploadLang.errorTooMuch + '</p>');
                    fixParentHeigth();
                } else {
                    $('#notice').html('<p class="alert alert-danger"><span class="fa fa-exclamation-circle"></span>&nbsp;' + metadata.msg + '</p>');
                    fixParentHeigth();
                }

            }
        });
    }

    function isValueInArray(arr, val) {
        return arr.reduce(function (col, item) {
            return col || (val.toLowerCase() == item.toLowerCase())
        }, false);
    }

    // pass the JSON data from the iframe to the main survey page
    function passJSON(fieldname, show_title, show_comment, pos) {
        var jsonArray = [];
        var filecount = 0;
        var licount = parseInt($('#' + fieldname + '_licount').val());
        var i = 1;

        while (i <= licount) {
            if ($("#" + fieldname + "_li_" + i).is(':visible')) {
                var fileObject = {
                    title: ($("#" + fieldname + "_show_title").val() == 1) ? $("#" + fieldname + "_title_" + i).val() : '',
                    comment: ($("#" + fieldname + "_show_comment").val() == 1) ? $("#" + fieldname + "_comment_" + i).val() : '',
                    size: $("#" + fieldname + "_size_" + i).val(),
                    name: $("#" + fieldname + "_name_" + i).val(),
                    filename: $("#" + fieldname + "_filename_" + i).val(),
                    ext: $("#" + fieldname + "_ext_" + i).val()
                };
                filecount += 1;
                jsonArray.push(fileObject);
            }
            i++;
        }


        $('#' + fieldname).val(JSON.stringify(jsonArray));
        copyJSON(filecount, fieldname, show_title, show_comment, pos);
    }

    const copyJSON = function(filecount, fieldname, show_title, show_comment, pos) {
        $('#'+fieldname+'_filecount').val(filecount);
        window['uploadQuestionController_' + fieldname].displayUploadedFiles(filecount, fieldname, show_title, show_comment, pos);
    }

    var saveAndExit = function (fieldname, show_title, show_comment, pos) {
        var filecount = parseInt($('#' + fieldname + '_filecount').val());
        var minfiles = parseInt($('#' + fieldname + '_minfiles').val());

        if (minfiles != 0 && filecount < minfiles && showpopups) {
            var confirmans = confirm(uploadLang.errorNeedMoreConfirm.replace('%s', (minfiles - filecount)))
            if (confirmans) {
                passJSON(fieldname, show_title, show_comment, pos);
                return true
            } else
                return false;
        } else {
            passJSON(fieldname, show_title, show_comment, pos);
            return true;
        }
    }

    var deletefile = function (fieldname, count) {

        var file_index;
        var filename = $("#" + fieldname + "_filename_" + count).val();
        var name = $("#" + fieldname + "_name_" + count).val();

        var filecount = parseInt($('#' + fieldname + '_filecount').val());
        var licount = parseInt($('#' + fieldname + '_licount').val());

        $.ajax({
                method: "POST",
                url: uploadurl,
                data: {
                    'delete': 1,
                    'fieldname': fieldname,
                    'filename': filename,
                    'name': name,
                    YII_CSRF_TOKEN: options.csrfToken
                }
            })
            .done(function (msg) {
                $('#notice').html('<p class="alert alert-success"><span class="fa fa-check"></span>&nbsp;' + msg + '</p>');
                setTimeout(function () {
                    $(".success").remove();
                }, 5000);
                $("#" + fieldname + "_li_" + count).hide();
                filecount--;
                $('#' + fieldname + '_filecount').val(filecount);
                file_index = $("#" + fieldname + "_file_index_" + count).val();
                for (j = count; j <= licount; j++) {
                    if ($('#' + fieldname + '_li_' + j).is(":visible")) {
                        $('#' + fieldname + '_file_index_' + j).val(file_index);
                        file_index++;
                    }
                }
                var minfiles = parseInt($('#' + fieldname + '_minfiles').val());
                var maxfiles = parseInt($('#' + fieldname + '_maxfiles').val());

                if (filecount < minfiles) {
                    $('#uploadstatus').html(uploadLang.errorNeedMore.replace('%s', (minfiles - filecount)));
                    fixParentHeigth();
                } else {
                    $('#uploadstatus').html(uploadLang.errorMoreAllowed.replace('%s', (maxfiles - filecount)));
                    fixParentHeigth();
                }
            });
    }

    return {
        init: init,
        saveAndExit: saveAndExit,
    };
}


function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.getUploadHandler = function(qid, options){
    if (!window.currentUploadHandler){
        window.currentUploadHandler = new uploadHandler(qid, options);
    }
    window.currentUploadHandler.init();
    return window.currentUploadHandler;
}
