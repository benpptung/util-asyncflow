'use strict';

app.get('/cats', function(request, response) {
  var User = request.models.User;
  async.seq(
    _.bind(User.get, User),  // 'User.get' has signature (id, callback(err, data))

    function(user, fn) {
      user.getCats(fn);      // 'getCats' has signature (callback(err, data))
    }
  )(req.session.user_id, function (err, cats) {
    if (err) {
      console.error(err);
      response.json({ status: 'error', message: err.message });
    } else {
      response.json({ status: 'ok', message: 'Cats found', data: cats });
    }
  });
});


app.get('/cats', function(request, response) {

  var User = request.models.User;
  var async = new Async();

  // It is clear req.session.user_id is for User.get()!!
  async.task(User.get.bind(User), req.session.user_id);
  // or async.task(User.get(), req.session.user_id) , if .get() return an async function bind `this` back to User
  // for example,
  // prototype.get = function() {
  //   return (id, next)=> {
  //     // bind `this` to User and as an Async function
  //   }
  // }

  async.wait(function(user, fn) {
    user.getCats(fn)
  });

  // #1 handle cats found
  async.run(function(err, cats) {
    if (err) {
      console.error(err);
      response.json({ status: 'error', message: err.message });
    } else {
      response.json({ status: 'ok', message: 'Cats found', data: cats });
    }
  })

  // #2 handle cats found
  async.wait(function(cats, fn) {
    response.json({status: 'ok', message: 'Cats found', data: cats});
    fn();
  })

  async.run(err=> {
    if (err) {
      console.error(err);
      response.json({status: 'error', message: err.message});
    }
  });

});