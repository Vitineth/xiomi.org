const hasWebP = (function() {
    // some small (2x1 px) test images for each feature
    var images = {
        basic: "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==",
        lossless: "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA="
    };

    return new Promise(function (resolve, reject){
        const img = document.createElement('img');
        img.onload = function() {
            // the images should have these dimensions
            if(this.width === 2 && this.height === 1) {
                resolve(true);
            } else {
                resolve(false);
            }
        };
        img.onerror = function() {
            resolve(false);
        };
        img.src = images['basic'];
    });
});

hasWebP().then(function(support) {
    document.getElementById('change-back').onclick = change;

    if(!support){
        document.getElementById('primary-card').style.backgroundImage = 'url("img/header-keyboard.png")';
        document.getElementById('p2-card').style.backgroundImage = 'url("img/header-winter.jpg")';
    }

    const ext = support ? 'webp' : 'png';

    const cardImages = [
        ext ? 'img/webp/header-forest.webp' : 'img/header-forest.png',
        ext ? 'img/webp/header-keyboard.webp' : 'img/header-keyboard.png',
        ext ? 'img/webp/header-sound.webp' : 'img/header-sound.png',
        ext ? 'img/webp/header-winter.webp' : 'img/header-winter.jpg',
    ];
    let cardIndex = 0;
    const moveQueue = [];
    let isRunning = false;

    function preload(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () {
                resolve();
            }
            img.src = url;
            if (img.complete) img.onload();
        })
    }

    function change() {
        if(isRunning){
            console.log('already running, pushing');
            moveQueue.push(0);
            return;
        }

        console.log('executing');
        isRunning = true;

        const active = document.querySelector('.card.active');
        const next = document.querySelector('.card.next');

        const activeCrossfade = document.querySelector('.card.active .crossfade');
        const nextCrossfade = document.querySelector('.card.next .crossfade');

        console.log(active, next, activeCrossfade, nextCrossfade);

        const nextImage = cardImages[(cardIndex + 1) % cardImages.length];
        const nextNextImage = cardImages[(cardIndex + 2) % cardImages.length];
        cardIndex++;

        Promise.all([
            preload(nextImage),
            preload(nextNextImage),
        ]).then(function () {
            // Move them into the next entries
            nextCrossfade.style.backgroundImage = `url('${nextNextImage}')`;
            activeCrossfade.style.backgroundImage = `url('${nextImage}')`;

            // Then we need to crossfade them in by raising their opacity
            // But first setup a callback for when its done to improve readability
            function done() {
                active.style.backgroundImage = activeCrossfade.style.backgroundImage;
                next.style.backgroundImage = nextCrossfade.style.backgroundImage;

                setTimeout(function(){
                    activeCrossfade.style.opacity = 0;
                    nextCrossfade.style.opacity = 0;

                    isRunning = false;
                    if (moveQueue.length > 0){
                        console.log('has waiting, running');
                        moveQueue.shift();
                        change();
                    } 
                }, 700);
            }

            let currentOpacity = 0;
            const interval = setInterval(function () {
                currentOpacity += 0.1;

                activeCrossfade.style.opacity = Math.min(currentOpacity, 1);
                nextCrossfade.style.opacity = Math.min(currentOpacity, 1);

                if (currentOpacity >= 1) {
                    clearInterval(interval);
                    done();
                }
            }, 50);
        })
    }
})