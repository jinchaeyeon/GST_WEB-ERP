import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';

export default function DoughnutChart(props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        if(props.data != null){
            const propsData = props.data;
           
            const data = {
                labels: props.label,
                datasets: [
                    {
                        data: [propsData.okcnt, propsData.badcnt],
                        backgroundColor: [
                            "#d7ecfb",
                            "#fbded7", 
                        ],
                        hoverBackgroundColor: [
                            "#1976d2",
                            "#FF0000", 
                        ]
                    }
                ]
            };
            const options = {
                cutout: '60%'
            };
    
            setChartData(data);
            setChartOptions(options);
        }
    }, [props.data]);

    return (
        <div className="card flex justify-content-center">
            <Chart type="doughnut" data={chartData} options={chartOptions} className="w-full md:w-30rem" />
        </div>
    )
}