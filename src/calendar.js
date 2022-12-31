import {useRef , useEffect, useState } from 'react'
import faLocale from '@fullcalendar/core/locales/fa'
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import moment from 'jalali-moment'
import axios from "axios";
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';

import tippy from 'tippy.js';
import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';

import 'bootstrap/dist/css/bootstrap.rtl.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import { ReactComponent as RightIcon } from "./right.svg"
import { ReactComponent as LeftIcon } from "./left.svg"
import "./calendar.scss"


export default function Calendar({ ...props }) {
    const [activeView, setActiveView] = useState("dayGrid");
    const [range, setRange] = useState({})
    const [curentActiveMonth, setCurentActiveMonth] = useState(new Date())
    const [isLoadComplete, setIsLoadComplete] = useState(false)
    const [hlpMonthStartDayDate, setHlpMonthStartDayDate] = useState()
    const [hlpMonthEndDayDate, setHlpMonthEndDayDate] = useState()
    const [events , fetch_events] = useState()
    const jalaiDate = moment(new Date(curentActiveMonth)).locale('fa').format('YYYY/MM/DD')
    const month = resolveMonthName(jalaiDate.split('/')[1])
    const year = jalaiDate.split('/')[0]


    const fetchData = async () => {
        await axios.get("http://share.morsalat.ir/programs").then((res)=>{
            let data=res.data
            //remove
            let old = JSON.stringify(data).replace(/&quot;/g, '\'');
            let newArray = JSON.parse(old); //convert back to array
            fetch_events(newArray);
        })
    }
    

    useEffect(() => {
        fetchData()
        calculateCalendarDays(curentActiveMonth)
    }, [])

    const calculateCalendarDays = (activeDate) => {

        setIsLoadComplete(false)

        const jalaiMonthStartDate = moment(new Date(activeDate)).locale('fa').format('YYYY/MM/01')
        const hlpDate = new Date(moment.from(jalaiMonthStartDate, 'fa', 'YYYY/MM/DD').format('YYYY-MM-DD'))
        const calendarStartDate = hlpDate

        if (hlpDate.getDay() !== 6) {
            calendarStartDate.setDate(calendarStartDate.getDate() - (hlpDate.getDay() + 1))
        }

        const calendarEndDate = new Date(calendarStartDate)
        calendarEndDate.setDate(calendarEndDate.getDate() + 41)
        setRange({
            start: calendarStartDate,
            end: calendarEndDate
        })
        setActiveView(activeView)
        setIsLoadComplete(true)

        setHlpMonthStartDayDate(new Date(moment.from(jalaiMonthStartDate, 'fa', 'YYYY/MM/DD').format('YYYY-MM-DD')))
        const jalaiMonthEndDate = moment(new Date(activeDate)).locale('fa').add(1, 'jMonth').format('YYYY/MM/01')
        setHlpMonthEndDayDate(new Date(moment.from(jalaiMonthEndDate, 'fa', 'YYYY/MM/DD').format('YYYY-MM-DD')))

    }

    const showNextMonth = () => {
        const jalaiNextMonth = moment(new Date(curentActiveMonth)).add(1, 'jMonth')._d
        setCurentActiveMonth(jalaiNextMonth)
        calculateCalendarDays(jalaiNextMonth)
    }

    const showPreviousMonth = () => {
        const jalaiPreviousMonth = moment(new Date(curentActiveMonth)).subtract(1, 'jMonth')._d
        setCurentActiveMonth(jalaiPreviousMonth)
        calculateCalendarDays(jalaiPreviousMonth)
    }

    const showToday = () => {
        setCurentActiveMonth(new Date())
        calculateCalendarDays(new Date())
    }
    const calendar = document.getElementsByClassName('fc-daygrid-day')

    const dayCellDidMount = (hlpMonthStartDayDate, hlpMonthEndDayDate) => {
        for (let i = 0; i < calendar.length; i++) {
            calendar[i].className = calendar[i].className.replace(' fc-day-other', '')
            if ((new Date(calendar[i].getAttribute('data-date'))).getTime() >= new Date(hlpMonthEndDayDate).getTime() ||
                (new Date(calendar[i].getAttribute('data-date'))).getTime() < new Date(hlpMonthStartDayDate).getTime()) {
                calendar[i].className += ' fc-day-other'
            }
        }
    }
    const calendarRef = useRef();
    var view = 'dayGrid';
    useEffect(() => {
        changeView(view);
    }, [view]);


    const changeView = view2 => {
        const API = getApi();
        view= view2;
        API && API.changeView(view2);
    }

    const getApi = () => {
        const { current: calendarDom } = calendarRef;

        return calendarDom ? calendarDom.getApi() : null;
    }
    const [show, setShow] = useState(false);
    var [modalbody,setbody] = useState("empty");
    var [modaltitle,settitle] = useState("empty");
    var [modalauthor,setauthor] = useState("empty");

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handle_event = (info) => {
        settitle(info.title);
        setauthor(info.extendedProps.field_full_name)
        const _start=moment(info.start).locale('fa').format('D MMMM ساعت hh:mm');
        const _end=moment(info.end).locale('fa').format('hh:mm');
        var ap_text= info.extendedProps.approved==="1" ? "تایید شده است." : "تایید نشده است." ;
        var ap_icon=info.extendedProps.approved==="0" ? `  <i class="bi bi-exclamation-triangle-fill"></i>  ` : `  <i class="bi bi-check-square-fill"></i>  ` ;
        var ap_class=info.extendedProps.approved ? "alert-success" : "alert-danger" ;
        const _approve=`<div class="alert ${ap_class}" role="alert">${ap_icon}زمان و مکان این رویداد توسط ناظر  ${ap_text} </div>`
        const _alert=`<div class="alert alert-success" role="alert">  این برنامه ${_start} در ${info.extendedProps.field_place}  به صورت ${info.extendedProps.field_type_metting} آغاز و در ساعت   ${_end} به پایان می رسد.</div>`
        setbody(_alert+_approve+info.extendedProps.description);
    }

    return (
        <>
            {isLoadComplete &&
                <>

                    <div className='claendar-toolbar'>
                        {/*<div*/}
                        {/*className='toolbar-arrow-right'*/}
                        {/*onClick={() =>{*/}
                        {/*    let next = view === "dayGrid" ? "timeGridWeek" : "dayGrid"*/}
                        {/*    changeView((next))*/}
                        {/* }*/}
                        {/*    */}
                        {/*  }*/}
                        {/*>*/}
                        {/*    نمایش هفته*/}
                        {/*</div>*/}
                        <div
                            className='toolbar-arrow-right'
                            onClick={showPreviousMonth}
                        >
                            <RightIcon />
                            ماه قبل
                        </div>
                        <h1>{month} {year}</h1>
                        <div className='left-toolbar'>
                            <div
                                className='toolbar-today'
                                onClick={showToday}
                            >
                                امروز
                            </div>
                            <div
                                className='toolbar-arrow-left'
                                onClick={showNextMonth}
                            >
                                ماه بعد
                                <LeftIcon />
                            </div>
                        </div>
                    </div>
                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title><h4 className="modal-title">{modaltitle}</h4></Modal.Title>
                        </Modal.Header>
                        <Modal.Body><div dangerouslySetInnerHTML={{ __html: modalbody }} /></Modal.Body>
                        <Modal.Footer>
                            <div className="alert alert-info alert-footer" role="alert">
                                ثبت شده توسط :{modalauthor}
                            </div>
                            <Button variant="secondary" onClick={handleClose}>
                                بستن
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <FullCalendar
                        initialView={view}
                        plugins={[dayGridPlugin,timeGridPlugin]}
                        ref={calendarRef}
                        locale={faLocale}
                        themeSystem='bootstrap5'
                        visibleRange={range}
                        dayCellDidMount={() => dayCellDidMount(hlpMonthStartDayDate, hlpMonthEndDayDate)}
                        headerToolbar={false}
                        eventClick= {(info)=> {
                            //console.log(info.event.extendedProps)
                            handle_event(info.event)
                            handleShow(true)
                        }}
                        eventDidMount={(info) => {
                            // console.log(info.event);
                            // console.log(range)
                            const msg= info.event.extendedProps.approved === "1" ? "✅ (تایید شده)" : "🔴⚠️(در دست بررسی)"
                            tippy(info.el, {
                              placement: 'left',
                              animation: 'fade',
                              duration:[500,0],
                              content:msg+"<br>"+info.event.title,
                              allowHTML: true,
                              interactive: true,
                              interactiveDebounce: 75,
                              theme:'light-border',
                            });
                          }}
                        events = {events}
                        {...props}
                    />

                </>
            }
        </>
    )
    
    
}


export function resolveMonthName(monthNumber) {
    const monthName = {
        '01': 'فروردین',
        '02': 'اردیبهشت',
        '03': 'خرداد',
        '04': 'تیر',
        '05': 'مرداد',
        '06': 'شهریور',
        '07': 'مهر',
        '08': 'آبان',
        '09': 'آذر',
        1: 'فروردین',
        2: 'اردیبهشت',
        3: 'خرداد',
        4: 'تیر',
        5: 'مرداد',
        6: 'شهریور',
        7: 'مهر',
        8: 'آبان',
        9: 'آذر',
        10: 'دی',
        11: 'بهمن',
        12: 'اسفند',
    }[monthNumber]

    return monthName
}