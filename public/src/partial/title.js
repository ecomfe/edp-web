define(function () {
    return {
        set: function (title) {
            var el = document.getElementById('title');
            el.innerHTML = title;
            el.style.display = '';
        }
    }
});
