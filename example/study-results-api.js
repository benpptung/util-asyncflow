'use strict';

const Async = require('../lib/index');
const inspect = require('util').inspect;

/// An example using
/// http://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/

///// scope helpers
var UserModel = {
  user: {
    id: 1,
    notificationsEnabled: true
  },
  findById: function(id, done) {

    setTimeout(_=> {
      done(null, this.user);
    }, 10)
  }
}

function TaskModel(model, done) {
  setTimeout(_=> {
    done(null, {
      assignedUser: {
        id: 2
      }
    })
  }, 10);
}

var NotificationService = {

  sendNotification: function(id, message, next) {
    setTimeout(next, 10)
  }
};
/////


function asyncTask(cb) {

  var flow = new Async(UserModel);

  flow.task(UserModel.findById, 1);

  flow.wait((user, next)=> {
    if (!user) return cb('No user found');
    TaskModel({userId: user.id, name: 'Demo Task'}, next);
  })

  flow.task(next=> {
    let user = flow.in(0);
    if (user.notificationsEnabled) {
      return NotificationService.sendNotification(user.id, 'Task Created', next);
    }
    next();
  })

  flow.task(next=> {
    let user = flow.in(0);
    let savedTask = flow.in(1);
    if (savedTask.assignedUser.id !== user.id) {
      return NotificationService
        .sendNotification(savedTask.assignedUser.id, 'Task was created for you', next);
    }
    next();
  })

  flow.run(err=> {
    if (err) return cb(err);
    //cb(null, fl.results[1][0]);
    cb(null, flow.in(1));

    console.log('\ninspecting the fl.results......');
    console.log(inspect(flow.results, {colors: true, depth: 5}));

    console.log('in 0: ' + inspect(flow.in(0)));
    console.log('in 1: ' + inspect(flow.in(1)));
    console.log('in 2: ' + inspect(flow.in(2)));
    console.log('in 3: ' + inspect(flow.in(3)));
    console.log('in 4: ' + inspect(flow.in(4)));
  })
}


asyncTask((err, result)=> {
  console.log('we got the result >>>>');
  if (err) console.error(err);
  console.log(inspect(result, {colors: true, depth: 5}));
})