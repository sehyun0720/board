$(function(){
    function get2digits (num){
        return ('0' + num).slice(-2);
    }

    function getDate(dateObj){
        if(dateObj instanceof Date)
            return dateObj.getFullYear() + '-' + get2digits(dateObj.getMonth()+1) + '-' + get2digits(dateObj.getDate());
    }

    function getTime(dateObj){
        if(dateObj instanceof Date)
        return get2digits(dateObj.getHours()) + ':' + get2digits(dateObj.getMinutes()) + ':' + get2digits(dateObj.getSeconds());
    }

    function convertDate(){
        $('[data-date]').each(function(index,element){
            let dateString = $(element).data('date');
            if(dateString){
                let date = new Date(dateString);
                $(element).html(getDate(date));
            }
        });
    }

    function convertDateTime(){
        $('[data-date-time]').each(function(index,element){
            let dateString = $(element).data('date-time');
            if(dateString){
                let date = new Date(dateString);
                $(element).html(getDate(date)+ ' '+getTime(date));
            }
        });
    }

    convertDate();
    convertDateTime();
});

$(function(){
    let search = window.location.search;
    let params = {};

    if(search){
        $.each(search.slice(1).split('&'), function(index,param){
            let index = param.indexOf('=');
            if(index>0){
                let key = param.slice(0, index);
                let value = param.slice(index+1);

                if(!params[key]) params[key] = value;
            }
        });
    }

    if(params.searchText && params.searchText.length>=3){
        $('[data-search-highlight]').each(function(index,element){
            let $element = $(element);
            let searchHighlight = $element.data('search-highlight');
            let index = params.searchType.indexOf(searchHighlight);

            if(index>=0){
                let decodedSearchText = params.searchText.replace(/\+/g, ' ');
                decodedSearchText = decodeURI(decodedSearchText);

                let regex = new RegExp(`(${decodedSearchText})`, 'ig');
                $element.html($element.html().replace(regex, '<span class="highlighted">$1</span>'));
            }
        });
    }
});