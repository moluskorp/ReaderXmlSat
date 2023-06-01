import { db } from './dbmgr'

export const getNames = () => {
  const qry = 'SELECT * FROM test'
  return new Promise((res) => {
    db.all(qry, (_, rows) => {
      res(rows)
    })
  })
}

export const countTestTable = () => {
  const qry = 'SELECT count(*) FROM test limit 1'
  return new Promise((res) => {
    db.all(qry, (_, rows) => {
      res(rows)
    })
  })
}

export const createTestTable = () => {
  const qry = 'CREATE TABLE test (id INTEGER PRIMARY KEY, name VARCHAR);'
  return new Promise((res) => {
    db.all(qry, (e, rows) => {
      res(rows)
    })
  })
}

export const insertTestTable = () => {
  const str1 = 'paulao2'
  const qry = `INSERT INTO test (name) VALUES ('${str1}');`
  return new Promise((res) => {
    db.all(qry, (err) => {
      const response = {
        type: err ? 'error' : 'success',
      }
      res(response)
    })
  })
}

export const test = () => {
  // db.run('CREATE TABLE test (name VARCHAR, lastname VARCHAR)')
  console.log('bla')
  db.run('INSERT INTO test VALUES (Joao, Paulo)', (oi, err) => {
    console.log('oie', oi)
    if (err) {
      console.log('err', err)
    }
  })
  console.log('blu')
}
