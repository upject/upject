/*!
 * Determine if an element is in the viewport
 * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Node}    elem The element
 * @return {Boolean}      Returns true if element is in the viewport
 */
var isInViewport = function (elem) {
	var distance = elem.getBoundingClientRect();
	return (
		distance.top >= 0 &&
		distance.top <= (window.innerHeight || document.documentElement.clientHeight)
	);
};

window.addEventListener("load", function() {
    var vels = document.querySelectorAll(".video video");
    window.addEventListener('scroll', function (event) {
        vels.forEach(function(vel) {
            if (isInViewport(vel)) {
                if (vel.paused)
                    vel.play();
            }
            else {
                if (!vel.paused)
                    vel.pause();
            }
        })
    }, false);
});