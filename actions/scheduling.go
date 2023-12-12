package actions

import (
	"log"
	"mc_web_console/frameworkmodel/webtool"
	"net/http"
	"time"

	"github.com/go-co-op/gocron"
	"github.com/gobuffalo/buffalo"
)

// go-cron을 여기서 실행 시켜야 함.
type Scheduler struct {
	Spec          string
	Title         string
	StartTime     time.Time
	McisLifeCycle webtool.McisLifeCycle
	VmLifeCycle   webtool.VmLifeCycle
}

var c *gocron.Scheduler

// @Summary		 Cron 자동화
// @Description  시간별로 spec 와일드 카드 생성
// @Accept      time
// @Produce    	time
// @Router
func GoCron(s Scheduler) {
	//spec 와일드 카드로 생성(m h dom m dow)
	//

	c = gocron.NewScheduler(time.UTC)
	spec := s.Spec
	j, _ := c.Cron(spec).Do(DoWork, s)
	tag := "example"
	j.Tag(tag)
	// 해당 Tag에 걸린 JOB 없애기
	err := c.RemoveByTag(tag)
	if err != nil {
		//로그 찍고 DB 저장 할 것
	}

	// 스케쥴 건거 다음 시간 알아내기
	jobs, _ := c.FindJobsByTag(tag)

	j0 := jobs[0]
	nextTime := j0.NextRun()
	log.Println("nextTime by Tag : ", nextTime)
	now := time.Now()
	now.Date()
}

// 마지막 시작된 스케쥴 시간

// 해당 스케쥴의 다음 시간 알아내서 전달
func NextScheduleTimeByTag(t string) time.Time {
	j, err := c.FindJobsByTag(t)

	if err != nil {
		// 에러가 있을경우 해당 로직 처리 예정
	}
	getJob := j[0]

	nextTime := getJob.NextRun()

	return nextTime
}

// @Summary		스케줄러 폼 렌더링
// @Description  ID name 정보를 가지고 화면 호출 스케줄 폼으로 렌더링
// @Produce   html
// @Param	  mcisId mcisId
// @Param	  mcisName
// @Success 200	{html}	html	"operations/scheduler/mngform.html"
// @Router operations/scheduler/mngform/ [get]

func (a actions) schedulerMngForm(c buffalo.Context) error {
	mcisId := c.Param("mcisId")
	mcisName := c.Param("mcisName")

	c.Set("mcisId", mcisId)
	c.Set("mcisName", mcisName)

	return c.Render(http.StatusOK, r.HTML("operations/scheduler/mngform.html"))
}

// @Summary		SchedulingReg 등록
// @Description	 작업 스케줄 등록
// @Accept		json
// @Produce		json
// @Param  		scheduleSet.McisLifeCycle.NameSpaceID  query 	String  true "namespaceID"
// @Param  		scheduleSet.VmLifeCycle.NameSpaceID  query 		String  true "namespaceID"
// @Failure  500			{string}	string				"{'error':'respStatus.Message','status':respStatus.StatusCode}"
// @Router
func (a actions) SchedulingReg(c buffalo.Context) error {
	namespaceID := c.Session().Get("current_namespace_id").(string)

	// mcisLifeCycle := &webtool.McisLifeCycle{}
	// vmLifeCycle := &webtool.VmLifeCycle{}

	// if err := c.Bind(mcisLifeCycle);err != nil{
	// 	return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
	// 		"message": "fail",
	// 		"status":  "fail",
	// 	}))
	// }

	// if err := c.Bind(vmLifeCycle);err != nil{
	// 	return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
	// 		"message": "fail",
	// 		"status":  "fail",
	// 	}))
	// }
	// mcisLifeCycle.NameSpaceID = namespaceID
	// vmLifeCycle.NameSpaceID = namespaceID
	// scheduleSet.McisLifeCycle = *mcisLifeCycle
	// scheduleSet.VmLifeCycle = *vmLifeCycle
	scheduleSet := Scheduler{}

	// namespaceID Setting
	scheduleSet.McisLifeCycle.NameSpaceID = namespaceID
	scheduleSet.VmLifeCycle.NameSpaceID = namespaceID

	if err := c.Bind(scheduleSet); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"message": "fail",
			"status":  "fail",
		}))
	}
	// cron 을 통해 작업 스케쥴링
	GoCron(scheduleSet)

	return nil
}
