const FULL_DASH_ARRAY = 283;
const RESET_DASH_ARRAY = `-57 ${FULL_DASH_ARRAY}`;

//DOM elements
let timer = document.querySelectorAll("#base-timer-path-remaining");
let timeLabel = document.querySelectorAll("#base-timer-label");

//Time related vars
const TIME_LIMIT = 1800; //in seconds
let timePassed = -1;
let timeLeft = TIME_LIMIT;
let timerInterval = null;

function reset() {
  clearInterval(timerInterval);
  resetVars();
  startBtn.innerHTML = "Start";
  for (i = 0; i < timer.length; ++i) {
    timer[i].setAttribute("stroke-dasharray", circleDasharray);
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;

    for (i = 0; i < timeLabel.length; ++i) {
        timeLabel[i].innerHTML = formatTime(timeLeft);;
      }
    setCircleDasharray();

    if (timeLeft === 0) {
      timeIsUp();
    }
  }, 1000);
}

window.addEventListener("load", () => {
    for (i = 0; i < timeLabel.length; ++i) {
        timeLabel[i].innerHTML = formatTime(TIME_LIMIT);;
      }
  });

//---------------------------------------------
//HELPER METHODS
//---------------------------------------------

function timeIsUp() {
    startTimer();
}

function resetVars() {
  removeDisabled(startBtn);
  setDisabled(stopBtn);
  timePassed = -1;
  timeLeft = TIME_LIMIT;
  console.log(timePassed, timeLeft);
  timeLabel.innerHTML = formatTime(TIME_LIMIT);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  //console.log("setCircleDashArray: ", circleDasharray);
  for (i = 0; i < timer.length; ++i) {
    timer[i].setAttribute("stroke-dasharray", circleDasharray);
  }
}

startTimer();



/**
 * Point Animation
 */
$('.point').on('click', function(e) {
  var getTotalPoints = $('.point').length,
    getIndex = $(this).index(),
    getCompleteIndex = $('.point--active').index();

  TweenMax.to($('.bar__fill'), 0.6, {
    width: (getIndex - 1) / (getTotalPoints - 1) * 100 + '%'
  });

  if (getIndex => getCompleteIndex) {
    $('.point--active').addClass('point--complete').removeClass('point--active');

    $(this).addClass('point--active');
    $(this).prevAll().addClass('point--complete');
    $(this).nextAll().removeClass('point--complete');
  }
});

/*
  Demo Purposes
*/
var progressAnimation = function() {
  var getTotalPoints = $('.point').length,
    getIndex = Math.floor(Math.random() * 4) + 1,
    getCompleteIndex = $('.point--active').index();

  TweenMax.to($('.bar__fill'), 0.6, {
    width: (getIndex - 1) / (getTotalPoints - 1) * 100 + '%'
  });

  if (getIndex => getCompleteIndex) {
    $('.point--active').addClass('point--complete').removeClass('point--active');

    $('.point:nth-child(' + (getIndex + 1) + ')').addClass('point--active');
    $('.point:nth-child(' + (getIndex + 1) + ')').prevAll().addClass('point--complete');
    $('.point:nth-child(' + (getIndex + 1) + ')').nextAll().removeClass('point--complete');
  }
};


function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = $(".tab-content > div");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = $(".match-tabs > span");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }
  document.getElementById(tabName).style.display = "flex";
  evt.currentTarget.classList.add("active");
}

function openTab2(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = $(".main-content > div");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = $(".main-tabs > span");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.classList.add("active");
}

$(".create-match").click(function(){
    $(".modal-match").addClass("active");
});
$(".closemodal").click(function(){
    $(".modal-match").removeClass("active");
});

$(".user-tag").click(function(){
  $(".dropuser").toggleClass("active");
})


$(".votecancel").click(function(){
  const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,

    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
  Toast.fire({
    icon: "success",
    title: "Account unlinked"
  });
  
});