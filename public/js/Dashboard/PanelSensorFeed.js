class SensorFeed extends DashboardPanelSensorData {
  constructor(name, property) {
    super();
    this.idToUse = "SensorPanel";
    this.nameToUse = name;
    this.propertyToUse = property;
  }

  load(parentDivId, viewer, modelData) {
    if (!super.load(parentDivId, this.constructor.name, viewer, modelData))
      return;
    var SensorChart = this.drawChart();
    this.socketConnect(SensorChart);
    this.isolateButton();
  }

  socketConnect(chart) {
    if (!window.socket) window.socket = io.connect("http://localhost:3000");

    window.socket.on("SensorStream", (data) => {
      this.addData(chart, data);
    });
  }

  drawChart() {
    var ctx = document.getElementById("SensorLineChart");

    var data = {
      labels: [0],
      datasets: [
        {
          data: [0],
          cubicInterpolationMode: "monotone",
          backgroundColor: "rgba(239, 53, 47, 1)",
          borderColor: "rgba(239, 53, 47, 1)",
          fill: false,
          label: "Temperature",
        },
      ],
    };

    var options = { 
      title: {
        display: true,
        text: 'Realtime Sensor Data (Streaming From MongoDB)'

      },
      animation: false,
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Sensor ID'
            }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'value'
          }
        }]
      },
      tooltips: {
          mode: 'nearest',
          intersect: false
      },
      hover: {
        mode: 'nearest',
        intersect: false
      } 
    };
    var SensorChart = new Chart(ctx, {
      type: "line",
      data: data,
      options: options,
    });

    return SensorChart;
  }

  addData(chart, data) {
    var length = chart.data.labels.length;
    if (length >= 15) {
      chart.data.datasets[0].data.shift();
      chart.data.labels.shift();
    }

    chart.data.labels.push(moment().format("HH:mm:ss"));
    chart.data.datasets[0].data.push(data.temperature);

    chart.options.scales.xAxes[0].scaleLabel.labelString = "Sensor ID: " + data.sensor_id;

    chart.update();
  }

  removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
      dataset.data.pop();
    });
    chart.update();
  }

  isolateButton() {
    var _this = this;
    var isolateBtn = document.createElement("button");
    isolateBtn.type = "button";
    isolateBtn.setAttribute("rel", "sensorIsolate")
    isolateBtn.className = "btn btn-primary";
    isolateBtn.innerText = "Isolate Sensor on Model";
    document.getElementById("SensorPanelSensorFeed").appendChild(isolateBtn);
    $('button[rel="sensorIsolate"]').click(function () {
      var item = ["Temperature - Room 1", "Générique - 124"];
      _this.viewer.fitToView( _this.modelData.getIds(_this.propertyToUse, item[0]));
      _this.viewer.isolate(
        _this.modelData.getIds(_this.propertyToUse, item[0])
      );
    });
  }
}
