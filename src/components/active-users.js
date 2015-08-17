---
---
gapi.analytics.ready(function() {

  var charts = new Object();
  var dataTables = new Object();

  gapi.analytics.createComponent('ActiveUsers', {

    initialize: function(options) {

      // Allow container to be a string ID or an HTMLElement.
      this.container = typeof options.container == 'string' ?
      document.getElementById(options.container) : options.container;

      this.polling = false;
      this.activeUsers = 0;
    },

    execute: function() {
      // Stop any polling currently going on.
      if (this.polling) this.stop();

      // Wait until the user is authorized.
      if (gapi.analytics.auth.isAuthorized()) {
        this.getActiveUsers();
        this.getPageViewHistory();
      }
      else {
        gapi.analytics.auth.once('success', this.getActiveUsers.bind(this));
        gapi.analytics.auth.once('success', this.getPageViewHistory.bind(this));
      }
    },

    stop: function() {
      clearTimeout(this.timeout);
      this.polling = false;
      this.emit('stop', {activeUsers: this.activeUsers});
    },

    getActiveUsers: function() {
      var options = this.get();
      var pollingInterval = (options.pollingInterval || 5) * 1000
      var ga_id = options.ga_id;

      if (!(pollingInterval >= 1000)) {
        throw new Error('Frequency cannot be less than 1 second.');
      }

      this.polling = true;
      gapi.client.analytics.data.realtime
      .get({ids: "ga:" + ga_id, metrics:'rt:activeUsers'})
      .execute(function(response) {
        var value = response.totalResults ? + response.rows[0][0] : 0;

        if (value > this.activeUsers) this.onIncrease();
        if (value < this.activeUsers) this.onDecrease();

        this.activeUsers = value;
        $(this.container).prop('number', this.container.innerHTML).animateNumber({ number: value }, 2000);

        if (this.polling = true) {
          this.timeout = setTimeout(this.getActiveUsers.bind(this),
          pollingInterval);
        }
      }.bind(this));
    },

    getPageViewHistory: function() {
      var options = this.get();
      var pollingInterval = 60000; //minute
      var ga_id = options.ga_id;

      gapi.client.analytics.data.realtime
      .get({ids: "ga:" + ga_id, metrics:'rt:pageviews', dimensions:'rt:minutesAgo'})
      .execute(function(response) {
        if(response.code == undefined){
          var labels = [];
          var data = [];
          var count = 1;

          if(response.rows == undefined){
            response.rows = [];
          }

          $.each( response.rows , function( index, value ){
            if(value[0] > 0) {
              while (value[0] != count) {
                labels.unshift('-' + count + ' min');
                data.unshift(0);
                count++;
              }

              labels.unshift('-' + count + ' min');
              data.unshift(value[1]);
              count++;
            }
          });

          while (count < 30) {
            labels.unshift('-' + count + ' min');
            data.unshift(0);
            count++;
          }

          var dataTable = new google.visualization.DataTable();
          dataTable.addColumn('string', 'Minutes Ago');
          dataTable.addColumn('number', 'PageViews');

          $.each( labels , function( index, value ){
            dataTable.addRow([value, parseInt(data[index])]);
          });

          var chart = new google.visualization.SteppedAreaChart(document.getElementById("chart-" + ga_id));
          charts[ga_id] = chart;
          dataTables[ga_id] = dataTable;

          this.drawChart(chart, dataTable);
        }
        else {
          //something wrong
          var chart = charts[ga_id];
          var dataTable = dataTables[ga_id];

          var numRows = dataTable.getNumberOfRows();
          for (var i = 0; i < numRows - 1; i++) {
            var prev = dataTable.getValue(i + 1, 1);
            dataTable.setValue(i, 1, prev);
          }
          dataTable.setValue(numRows - 1, 1, 0);

          this.drawChart(chart, dataTable);
        }

        if (this.polling = true) {
          this.timeout = setTimeout(this.getPageViewHistory.bind(this),
          pollingInterval);
        }

      }.bind(this));
    },

    resize: function() {
      var options = this.get();
      var chart = charts[options.ga_id];
      var dataTable = dataTables[options.ga_id];
      this.drawChart(chart, dataTable);
    },

    drawChart: function(chart, dataTable) {
      var options = {
          backgroundColor: "transparent",
          legend: { position: 'none' },
          hAxis: { showTextEvery: 4 },
          vAxis: { minValue: 0, viewWindow: {min: 0 } },
          areaOpacity: 0.2,
          connectSteps: false,
          colors: ['#{{ site.color.primary }}'],
          lineWidth: 4,
      };

      chart.draw(dataTable, options);
    },

    onIncrease: function() {
      this.emit('increase', {activeUsers: this.activeUsers});
      this.emit('change', {
        activeUsers: this.activeUsers,
        direction: 'increase'
      });
    },

    onDecrease: function() {
      this.emit('decrease', {activeUsers: this.activeUsers});
      this.emit('change', {
        activeUsers: this.activeUsers,
        direction: 'decrease'
      });
    }
  });
});
