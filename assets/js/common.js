$(function() {
    // 유의사항 레이어 열기/닫기
    const BTN_LAYER_OPEN = $(".btn-open "), // 열기 버튼
        BTN_LAYER_CLOSE = ".layer__dimmed, .btn--close, .lay__dimmed",  // 닫기 버튼
        DIMMED_DOM = "<div class='lay__dimmed'></div>",
        DIMMEDCLASS = ".lay__dimmed";

    // 팝업 열기
    BTN_LAYER_OPEN.click(function() {
        $("body").css({"overflow" : "hidden", "padding-right" : "15px"});

        let layId = $(this).data("laypop-id");

        $("body").append(DIMMED_DOM);
        $(DIMMEDCLASS).addClass("show");
        $(".layer").hide();
        $("#" + layId).fadeIn(100, function() {
            $(this).addClass("on")

            // 퀴즈 레이어 플레이
            if(layId === "layQuiz") {
                quizPlayFunc();
            }
        });

        // 팝업 닫기
        $(document).on("click", BTN_LAYER_CLOSE, function() {
            $(DIMMEDCLASS).removeClass("show").detach();
            $("#" + layId).fadeOut(300).removeClass('on');
            $("body").removeAttr("style");

            clearEvtFunc();
        });
    });

    let initSlide = 0,
        totalPoint = [];

    // 퀴즈 진행
    function quizPlayFunc() {
        // 퀴즈 스와이퍼 생성 및 초기화
        quizSwiper = new Swiper(".quiz__swiper", {
            loop : false,
            slidesPerView : 1,
            spaceBetween : 0,
            on : {
                // 슬라이드 초기화
                "beforeInit" : function() {
                    let html = slideDomFunc(initSlide);

                    this.addSlide(initSlide, html);
                    this.update();
                }
            }
        });
        quizSwiper.init();
    }

    // 퀴즈 목록 클릭
    $(document).on("click", ".quiz__list > li", function() {
        slideClickFunc(this);
    });

    // 퀴즈 선택 시 액션
    // 질문지 선택 -> 선택한 탭 활성화(각 선택값 저장) -> 슬라이드 추가 -> 다음장 이동, 마지막 장 도달 시 버튼 노출(이벤트 참여, 리셋)
    function slideClickFunc(obj) {
        const THIS = obj;
        let swiperIdx = $(THIS).closest(".swiper-slide").index() + 1, // 현재 슬라이드 Index
            currPoint = $(THIS).data("point"); // 선택한 퀴즈 점수

        console.log('클릭 : 스와이퍼 인덱스(다음장)' + swiperIdx)
        //선택한 탭 활성화
        $(THIS).addClass("on").siblings().removeClass("on");

        // 질문지 갯수(5개) 이하일 때, 슬라이드 추가 후 다음 장 이동
        if(swiperIdx < QUIZ_QUEST_ARR.length) {
            // 선택값 저장 [0~3]
            totalPoint.push(currPoint);
            console.log(currPoint);

            let html = slideDomFunc(swiperIdx);

            quizSwiper.appendSlide(html);
            quizSwiper.update();

            // 다음 장 이동
            setTimeout(function() {
                quizSwiper.slideTo(swiperIdx);
            }, 300);
        } else {  // 마지막 질문
            let lastPoint = totalPoint[QUIZ_QUEST_ARR.length - 1]

            if(lastPoint === undefined) { // 선택 전이면 push
                totalPoint.push(currPoint);

                // 선택 완료 -> 로딩 노출(1.5s) -> 결과 노출
                $(".quiz__swiper, .quiz__tit").fadeOut(function() {
                    $(".quiz__loading").fadeIn(function() {
                        setTimeout(function() {
                            $(".quiz__loading").fadeOut(function() {
                                //$(".quiz__result > img").addClass("result"+)
                                $(".quiz__result").addClass("on");

                                // 레이어 하단 버튼 노출 (이벤트 참여하기, 다시 시작하기)
                                $(".quiz__btn").addClass("on");
                            })
                        }, 2000);
                    });
                });
            } else { // 선택 변경 대입
                totalPoint[QUIZ_QUEST_ARR.length - 1] = currPoint;
            }

            // 레이어 하단 버튼 노출 (이벤트 참여하기, 다시 시작하기)
            //$(".quiz__btn").addClass("on")
        }

        // 선택값 최종
        console.log(totalPoint);
    }

    $(document).on("click", ".btn--restart", function() {
        resetEvtFunc();
    })

    // 퀴즈 리셋
    function resetEvtFunc() {
        $(".quiz__btn").removeClass("on");
        totalPoint = [];
        $(".quiz__list > li").removeClass("on");
        $(".quiz__result").removeClass("on");
        quizSwiper.slideTo(0, 0);
        $(".quiz__swiper, .quiz__tit").show();
    }

    function clearEvtFunc() {
        $(".quiz__btn").removeClass("on");
        totalPoint = [];
        console.log("클리어 " + totalPoint);
        $(".quiz__list > li").removeClass("on");
        $(".quiz__result").removeClass("on");

        if(quizSwiper) {
            quizSwiper.removeAllSlides();
        }
    }

    // 질문지 섞기
    function shuffleArray(array) {
        for(let loop = array.length - 1; loop >= 0; loop--) {
            let randomNum = Math.floor(Math.random() * (loop + 1));
            let randomArrayItem = array[randomNum];

            array[randomNum] = array[loop];
            array[loop] = randomArrayItem;
        }
        return array;
    }

    // 슬라이드 DOM 생성
    function slideDomFunc(idx) {
        let _idx = idx; // 질문지 인덱스

        // 섞인 질문 목록
        let shuffleMsg = shuffleArray(QUIZ_QUEST_ARR[_idx].msg);
        // 선택값, 선택 문장
        let point, txt;

        // DOM
        let html = "";
        html += "<div class='swiper-slide'>";
        html += "   <p class='tx_tit q" + _idx + "'>" + QUIZ_TITLE_ARR[_idx] + "</p>";

        html += "   <ul class='quiz__list'>";
        $.each(shuffleMsg, function(i, v) {
            point = v.split(":")[0]
            txt = v.split(":")[1]

            html += "<li data-point='" + point + "'><p>" + txt + "</p>"
        });
        html += "   </ul>"
        html += "</div>"

        return html;
    }

    // 퀴즈 타이틀
    const QUIZ_TITLE_ARR = [
        "Q.1 엄마가 되기 전 나는...",
        "Q.2. 나만의 출산 준비물 고르는 기준이 있다면?",
        "Q.3. 드디어 D-30, 태어날 아이를 기다리는 나의 기분은?",
        "Q.4. 엄마가 된 후 가장 많이 들었던 말은?",
        "Q.5. 아이에게 전하고 싶은 말이 있다면"
    ];

    // 퀴즈 질문지
    const QUIZ_QUEST_ARR = [
        {
            "msg" : [
                "0:빨리 결혼해서 엄마가 되는 게 꿈이었어!",
                "1:요즘 멋진 엄마들 많던데, 나도 도전?",
                "2:우릴 닮은 아이가 생긴다면 얼마나 사랑스러울까?",
                "3:아이가 생기면 누구보다 친한 친구가 되어줘야지!"
            ]
        },
        {
            "msg" : [
                "0:정보는 나의 힘!<br>각종 커뮤니티 및 주요 브랜드 팔로우는 기본!",
                "1:무조건 친환경!<br>환경을 생각하는 브랜드가 제품도 만족스럽더라구요",
                "2:어떤 원단인지, 어떻게 마감했는지<br>디테일한 부분까지 꼼꼼히 봤어요",
                "3:육아 선배님들이 추천해주신 덕분에<br>어렵지 않게 준비완료!"
            ]
        },
        {
            "msg" : [
                "0:엄마라는 본분을 다 할 수 있도록<br>좋은 엄마가 되는법에 대해 매일 공부하고 있어요",
                "1:가장 좋은 태교는 엄마의 행복!<br>스트레스 안 받으려고 노력중이에요",
                "2:우리 아이 얼른 보고싶어요♥<br>한 달이 너무 길게 느껴져요",
                "3:그 동안 힘들었을 우리 남편…<br>나도 조금 더 힘낼게!"
            ]
        },
        {
            "msg" : [
                "0:우리 아가는 엄마가 든든하게<br>지켜주니 엄청 좋겠다~",
                "1:그건 어떤 브랜드예요?<br>저도 좀 알려주세요",
                "2:웃는 모습이 아이랑 엄마랑<br>완전 붕어빵이네요",
                "3:어쩜 그렇게 아이 맘을 잘 아세요?<br>저희 아이는 매일 울던데ㅠㅠ"
            ]
        },
        {
            "msg" : [
                "0:우리 아이 하고싶은 거 다 해♥",
                "1:아가야, 빨리 커서 엄마에게 효도하렴",
                "2:다른 건 필요없고 건강하게만 자라다오",
                "3:네가 뭘하든 엄마는 응원할거야!"
            ]
        }
    ];
});