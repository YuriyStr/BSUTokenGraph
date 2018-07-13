$(document).ready(() => {
    $("#search").on("change", (evt) => {
        let address = $("#search").val().trim();
        currentAddress = address;
        $.get('/balances', { address: address })
            .done((data) => {
                $("#search").val('');
                let dates = data['dates'].map((timestamp) => {
                    return new Date(timestamp * 1000);
                });
                drawGraph(dates, data['balanceValues']);
            })
            .fail((xhr) => {
                console.log ('Problem connecting server.');
                console.log (xhr);
            });
        watchBalance(address);
    });
});

let currentAddress = '';

function watchBalance(address) {
    setTimeout(() => {
        $.get('/updatedBalances', { address: address })
            .done((data) => {
                let dates = data['dates'].map((timestamp) => {
                    return new Date(timestamp * 1000);
                });
                drawGraph(dates, data['balanceValues']);
            })
            .fail((xhr) => {
                console.log ('Problem connecting server.');
                console.log (xhr);
            });
        if (currentAddress === address) {
            watchBalance(address);
        }
    }, 15000);
}

function drawGraph(x, y) {
    let dataPoints = [];
    for (let i = 0; i < x.length; i++) {
        dataPoints.push({
            x: x[i],
            y: y[i]
        });
    }
    let max_date = new Date();
    max_date.setDate(x[x.length - 1].getDate() + 1 );
    let max_money = Math.max.apply(null, y);
    max_money += max_money / 10;
    let chart = new CanvasJS.Chart("plotContainer", {
        zoomEnabled: true,
        title: {text: " BSU balance "},
        data: [{
            type: "line",
            dataPoints: dataPoints
        }],
        axisX: {
            labelAngle: -60,
            title: "Time",
            valueFormatString: "DD-MM-YYYY, HH:mm",
            minimum: x[0],
            maximum: max_date
        },
        axisY: {
            title: "Money",
            minimum: 0,
            maximum: max_money,
        }
    });
    chart.render();
}

