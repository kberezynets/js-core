/*Необхідно реалізувати наступний функціонал як на відео Puzzle, а саме:*/

$(document).ready(function () {

    let TimerID;
    let startTimer;
    let pause = 0;
    let timerWorks = false;
    let intervalCleared = false;
    let timeOver = false;

    $('button').mousedown(function () {
        $(this).css('outline', '3px solid rgba(255, 80, 50, 0.5)');
    })

    $('button').mouseup(function () {
        $(this).css('outline', 'none');
    })

    $('#check').mousedown(function () {
        $(this).css('outline', '3px solid rgba(0, 128, 0, 0.5)');
    })

    /*— Необхідно розбити картинку на 16 рівних частин і помістити їх в блоки. Розбивати картинку на кусочки можна за допомогою background-position*/

    function start() {

        let pNumber = [];
        for (let i = 0; i < 16; i++) {
            pNumber[i] = i + 1;
        }

        let idx;
        let startParts = "";
        let finishParts = "";

        for (let i = 0; i < 16; i++) {
            startParts += `<div class="part"><div class="image"></div></div>`;
            finishParts += `<div class="part"></div>`;
        }
        $('#startBox').append(startParts);
        $('#finishBox').append(finishParts);

        $('.image').each(function () {
            idx = Math.floor(Math.random() * pNumber.length);
            $(this).addClass(`p${pNumber[idx]}`)
            pNumber.splice(idx, 1);
        })

        let x, y;
        for (let i = 0; i < 16; i++) {
            x = i % 4 * (-80) + 'px';
            y = Math.trunc(i / 4) * (-80) + 'px';
            newClass = 'p' + (i + 1);
            $(`.p${i + 1}`).css('background-position', `${x} ${y}`);
        }
    }

    function sort() {
        $('.part').sortable({
            connectWith: '.part',
        })
    }
    
    start();
    sort();

    /*— При кліку на кнопку Start game або при перетягуванні пазла на правий блок(використовуємо drag & drop) має запуститися зворотній відлік. Сама кнопка має заблокуватися.
    — Якщо час закінчився і ви не встигли скласти пазл має видати повідомлення в модальному вікні: “It's a pity, but you lost”. Кнопка Check result має заблокуватися*/

    function onMoveTimer() {
        $('.image').mousedown(function () {
            if (!timerWorks) {
                timer();
            }
        })
    }

    onMoveTimer();

    $('#start').click(function () {
        // $(this).css('outline', '3px solid rgba(255, 80, 50, 0.5)');
        if (!timerWorks) {
            timer();
        }
    })

    function youLost() {
        $('#modal-2').removeClass("hide");
        $('#modal-1').addClass("hide");
        $('#checkResult').prop('disabled', true);
    }

    function timer() {
        let timerTime = 1000 * 60;
        timerWorks = true;
        startTimer = new Date();
        TimerID = setInterval(function () {
            let currentTime = new Date();
            let diffTime = timerTime - (currentTime.getTime() - startTimer.getTime()) - pause;
            let sec = Math.floor((diffTime % (1000 * 60)) / 1000);

            if (sec >= 0) {
                if (sec < 10) {
                    sec = '0' + sec;
                }
                $('.timer').html(`00:${sec}`);
            }
            else {
                clearInterval(TimerID);
                intervalCleared = true;
                timeOver = true;
                $('.timer').html(`00:00`);
                youLost();
            }
        })
        $('#start').prop('disabled', true);
        $('#checkResult').prop('disabled', false);
    }

    /*— При кліку на кнопку Check result має видати повідомлення в модальному вікні: “You still have time, you sure?” з часом який залишився.*/

    let pauseText;
    $("#checkResult").click(function () {

        $('#modal-1').removeClass("hide");

        pause += new Date() - startTimer;
        pauseText = $('.timer').html();

        let h2text;
        h2text = $(`#haveTime`).text() + ' ' + pauseText;
        $(`#haveTime`).text(h2text);

        clearInterval(TimerID);
        intervalCleared = true;
    })

    /*— При кліку на кнопку Check перевіряється чи добре складений пазл, якщо так видає повідомлення: “Woohoo, well done, you did it!” в іншому варіанті “It's a pity, but you lost”. Кнопка Check result має заблокуватися.*/

    $("#check").click(function () {

        $('#modal-1').addClass("hide");
        let check = true;
        for (let i = 0; i < 16; i++) {
            if ($(`#finishBox .image`).eq(i).attr('class') != `image p${i + 1} ui-sortable-handle`) {
                check = false;
                break;
            }
        }

        if (pauseText != '') {
            $('.timer').html(pauseText);
        }

        if (check) {
            if (!intervalCleared) {
                $('.timer').html(pauseText);
                clearInterval(TimerID);
                intervalCleared = true;
            }
            $('#modal-2 h2').text(`Woohoo, well done, you did it!`);
            $('#modal-2').removeClass("hide");
            $('#checkResult').prop('disabled', true);
        }
        else {
            if (!intervalCleared) {
                clearInterval(TimerID);
                intervalCleared = true;
            }
            youLost();
        }
    })

    /*— При кліку на кнопку Close закриває модальне вікно.*/

    $("#close").click(function () {
        $('#modal-1').addClass("hide");
        $(`#haveTime`).text('You still have time, you sure?');
        timer();
    })

    $("#close2").click(function () {
        $('#modal-2').addClass("hide");
        $('#start').prop('disabled', true);
        $('#checkResult').prop('disabled', true);
        if (!intervalCleared) {
            clearInterval(TimerID);
            intervalCleared = true;
        }
        if (timeOver){
            $('.timer').html('00:00');
        }
        else {
            if (pauseText != '') {
            $('.timer').html(pauseText);
            }
        }
    })

    /*— При кліку на кнопку New game скидує час і заново рандомно розставляє пазли. Кнопка Start game має розблокуватися, а кнопка Check result має бути заблокована.*/

    $("#newGame").click(function () {
        $('#start').prop('disabled', false);
        $('#checkResult').prop('disabled', true);
        $('.box').html("");
        if (!intervalCleared) {
            clearInterval(TimerID);
            intervalCleared = true;
        }
        $('.timer').html(`01:00`);
        timerWorks = false;
        pause = 0;
        pauseText = '';
        $(`#haveTime`).text('You still have time, you sure?');
        $(`#modal2h2`).text(`It's a pity, but you lost`);
        intervalCleared = false;
        start();
        sort();
        onMoveTimer();
    })
})