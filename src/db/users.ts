const records = [
    {
      id: 1,
      username: 'user',
      password: '123456',
      displayName: 'demo user',
      emails: [{ value: 'user@mail.ru' }],
    },
    {
      id: 2,
      username: 'jill',
      password: 'birthday',
      displayName: 'Jill',
      emails: [{ value: 'jill@example.com' }],
    },
  ]
  
  exports.findById = function (id, cb) {
    process.nextTick(function () {
      const idx = id - 1
      if (records[idx]) {
        cb(null, records[idx])
      } else {
        cb(new Error('User ' + id + ' does not exist'))
      }
    })
  }
  
  exports.findByUsername = function (username, cb) {
    process.nextTick(function () {
      let i = 0, len = records.length
      for (; i < len; i++) {
        const record = records[i]
        if (record.username === username) {
          return cb(null, record)
        }
      }
      return cb(null, null)
    })
  }
  
  exports.verifyPassword = (user, password) => {
    return user.password === password
  }

  exports.createUser = function (username, password, displayName, email, cb) {
    process.nextTick(function () {
      const existing = records.find(r => r.username === username)
      if (existing) {
        return cb(new Error('User already exists'))
      }
      const id = records.length ? Math.max(...records.map(r => r.id)) + 1 : 1
      const user = {
        id,
        username,
        password,
        displayName: displayName || username,
        emails: email ? [{ value: email }] : [],
      }
      records.push(user)
      cb(null, user)
    })
  }