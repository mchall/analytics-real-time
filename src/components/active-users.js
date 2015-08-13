gapi.analytics.ready(function() {

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
      }
      else {
        gapi.analytics.auth.once('success', this.getActiveUsers.bind(this));
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
        this.container.innerHTML = value;

        if (this.polling = true) {
          this.timeout = setTimeout(this.getActiveUsers.bind(this),
          pollingInterval);
        }
      }.bind(this));

      gapi.client.analytics.data.realtime
      .get({ids: "ga:" + ga_id, metrics:'rt:pageviews', dimensions:'rt:minutesAgo'})
      .execute(function(response) {
        var labels = [];
        var data = [];
        var count = 0;
        $.each( response.rows , function( index, value ){

          while (value[0] != count) {
            labels.unshift('');
            data.unshift(0);
            count++;
          }

          labels.unshift('');
          data.unshift(value[1]);
          count++;
        });

        while (count < 30) {
          labels.unshift('');
          data.unshift(0);
          count++;
        }

        var chartData = {
          labels: labels,
          datasets: [
            {
              fillColor: "dodgerblue",
              data: data
            }
          ]
        };
        var ctx = $("#chart-" + ga_id)[0].getContext("2d");
        var barChart = new Chart(ctx).Bar(chartData);
      });
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
