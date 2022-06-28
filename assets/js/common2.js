$(function(){
    let quizSwiper
        initSlide = 0,               // 처음 슬라이드
        totalPoint = [],            // 선택한 문항
        quizwrap = $(".quizbox"),        // 퀴즈 박스
        quizTit = $(".quiz__tit"),       // 엄마유형테스트
        obj_target = $(".quiz__list > li");

    let eGame = {
        el : {
            /* initSlide: 0,               // 처음 슬라이드
            totalPoint : [],            // 선택한 문항
            quizwrap: $(".quizbox"),        // 퀴즈 박스
            quizTit: $(".quiz__tit"),       // 엄마유형테스트
            obj_target: $(".quiz__list > li") */
        },
        init : function(){
            _self = this;

            console.log("/////INIT ")
            // 퀴즈 스와이퍼 생성 및 초기화
            quizSwiper = new Swiper(".quiz__swiper", {
                loop : false,
                slidesPerView : 1,
                spaceBetween : 0,
                on : {
                    // 슬라이드 초기화
                    "beforeInit" : function() {
                        let html = eGame.slideDom(initSlide)

                        this.addSlide(initSlide, html)
                        this.update()
                    }
                }
            })

            _self.start()
        },
        stop : function() {
            //this.el.obj_target.off('click');
        },
        start : function(){
            _self = this;

            $(document).on("click", ".quiz__list > li", function(){
                quizClick(this)
                return false;
            })

			function quizClick(_item){
                // 퀴즈 선택 시 액션
                // 질문지 선택 -> 선택한 탭 활성화(각 선택값 저장) -> 슬라이드 추가 -> 다음장 이동, 마지막 장 도달 시 버튼 노출(이벤트 참여, 리셋)            
                const THIS = _item;
                let swiperIdx = $(THIS).closest(".swiper-slide").index() + 1, // 현재 슬라이드 Index
                    currPoint = $(THIS).data("point"); // 선택한 퀴즈 점수

                console.log('클릭 : 스와이퍼 인덱스(다음장)' + swiperIdx)
                //선택한 탭 활성화
                $(THIS).addClass("on").siblings().removeClass("on");

                // 질문지 갯수(5개) 이하일 때, 슬라이드 추가 후 다음 장 이동
                if(swiperIdx < QUIZ_QUEST_ARR.length) {
                    // 선택값 저장 [0~3]
                    totalPoint.push(currPoint);
                    console.log("선택한 문항 번호 : " + currPoint);

                    // 다음 장 Html append 
                    let html = eGame.slideDom(swiperIdx);
                    quizSwiper.appendSlide(html);
                    quizSwiper.update();

                    // append 한 뒤 다음 장으로 이동
                    setTimeout(function() {
                        quizSwiper.slideTo(swiperIdx);
                    }, 300);

                } else {  // 마지막 질문

                    let lastPoint = totalPoint[QUIZ_QUEST_ARR.length - 1]

                    if(lastPoint === undefined) { // 선택 전이면 push
                        totalPoint.push(currPoint);

                        // 임의로 넣은 결과 이미지 번호 입니다.
                        resultNum = Math.floor(Math.random() * 4);
                        
                        // 선택 완료 
                        $(".quiz__swiper, .quiz__tit").fadeOut();
                        
                        // 로딩 노출(2s)
                        console.log("로딩 2s ")
                        $(".quiz__loading").fadeIn(function() {
                            setTimeout(function() {
                                console.log("로딩 숨김 ")
                                // 로딩 숨김
                                $(".quiz__loading").fadeOut(function() {
                                    
                                    // 결과 노출
                                    console.log("결과 노출 " + resultNum)
                                    let resultImg = "<img src='assets/images/result_img"+resultNum+".png' alt=''>"
                                    $(".quiz__result").append(resultImg)
                                    $(".quiz__result").fadeIn().addClass("on");

                                    // 레이어 하단 버튼 노출 (이벤트 참여하기, 다시 시작하기)
                                    $(".quiz__btn").addClass("on");
                                })
                            }, 2000)
                        })
                    } else { // 선택 변경 대입
                        totalPoint[QUIZ_QUEST_ARR.length - 1] = currPoint;
                    }
                }

                // 선택값 최종}
                console.log("선택값 최종 : " + totalPoint);
            }
        },    
        reset : function(){
            console.log("//////////////////리스타트 ")
            initSlide = 0
            totalPoint = []
            $(".quiz__result").hide().removeClass("on")
            $(".quiz__result > img").detach()

            console.log(totalPoint)
            quizSwiper.removeAllSlides()
            quizSwiper.destroy()
        },
        slideDom: function(idx){
            let _idx = idx; // 질문지 인덱스

            // 섞인 질문 목록
            let shuffleMsg = eGame.shuffleArray(QUIZ_QUEST_ARR[_idx].msg);
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
        },
        shuffleArray: function(array){
            for(let loop = array.length - 1; loop >= 0; loop--) {
                let randomNum = Math.floor(Math.random() * (loop + 1));
                let randomArrayItem = array[randomNum];

                array[randomNum] = array[loop];
                array[loop] = randomArrayItem;
            }
            return array;
        }
    }

    // 
    $(".btn-open").on("click", function(){
        let _layer = $(this).data("laypop-id")
        
        $("body").css({
            "overflow" : "hidden", 
            "padding-right" : "15px"
        }).append("<div class='lay__dimmed'></div>")
        $(".lay__dimmed").addClass("show");


        $("#"+_layer).fadeIn(100, function(){
            $(this).addClass("on")

            eGame.init()
        })
    })

    $(".btn--close").on("click", function(){
        var _layer = $(this).closest(".layer")

        $("body").removeAttr("style")
        $(".lay__dimmed").removeClass("show").delay(300).detach();

        $(_layer).fadeOut(100, function(){
            $(this).removeClass("on")

            eGame.reset()
        })
    })

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
})