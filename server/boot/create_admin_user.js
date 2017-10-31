'use strict';

module.exports = (app) => {
  let RoleMapping = app.models.RoleMapping;
  const Profile = app.models.Profile;
  const Role = app.models.Role;
  Profile.count({
    where: {username: 'admin'},
  }, (err, count) => {
    if (count < 1) {
      return;
    }
    Profile.create({
      username: 'admin', password: '11223344', email: 'luigilahi@gmail.com',
    }, (err, profile) => {
      if (err) throw err;
      console.log('Admin user created');
      Role.create({
        name: 'admin',
      }, (err, role) =>  {
        if (err) throw err;
        console.log('Role created');
        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: profile.id,
        }, (err, principal) => {
          if (err) throw err;
        });
      });
    });
  });
};
