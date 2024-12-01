let MV = {
    contentRoot: 'content/',
    contentTargetId: 'content',
    lastError: null,
    lastRoute: 'home',

    startup: function() {
        MV.updateRoute();
        window.onpopstate = MV.updateRoute;
        window.onkeydown = MV.keyHandler;
    },

    keyHandler: function(e) {
        MV.closeLightbox();
    },

    updateRoute: function() {
        let hash = window.location.hash;
        if (hash && hash.length > 1)
            MV.route(window.location.hash.substring(1));
        else
            MV.route('home');
    },

    route: async function(target) {
        MV.lastRoute = target;
        
        document.querySelectorAll("#navbar > a").forEach((navlink) => {
            if (navlink.id == 'navlink.' + target)
                navlink.classList.add('active');
            else
                navlink.classList.remove('active');
        });

        let container = document.getElementById(MV.contentTargetId);
        container.classList.add("loading");
        window.scrollTo({top: 0, left:0, behavior:'smooth'})
        let newContent = await MV.getContent(target);
        let activeContent = document.createRange().createContextualFragment(newContent);
        while (container.firstChild)
            container.removeChild(container.firstChild);
        container.appendChild(activeContent);
        container.classList.remove("loading");
    },

    getContent: async function(id) {
        let path = MV.contentRoot + id + '.html';

        return (await fetch(path)
            .then((response) => {
                if (!response.ok)
                    throw new Error(`Failed to load content '${id}'`);

                return response.text();
            })
            .then((content) => {
                return content;
            })
            .catch(async (error) => {
                MV.lastError = error.message;
                return (await MV.getContent('notFound'));
            })
        );
    },

    showLightbox: function(target) {
        if (target.src)
            target = target.src;
        let lightbox = document.getElementById("lightbox");
        let lightboxImage = document.getElementById("lightboxImage");

        lightboxImage.src = target;
        lightbox.classList.add("active");
        document.body.classList.add("scrollLock");
    },

    closeLightbox: function() {
        let lightbox = document.getElementById("lightbox");
        lightbox.classList.remove("active");
        document.body.classList.remove("scrollLock");
    }
    
 
}