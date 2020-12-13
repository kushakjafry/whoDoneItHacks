"use strict";
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      if (!data || !data.name) {
        ctx.throw(400, "Please put name");
      }
      if (!files || !files.image) {
        ctx.throw(400, "Please ad a file");
      }

      const { user } = ctx.state;
      entity = await strapi.services.pet.create(
        { ...data, ...{ user: user } },
        { files }
      );
    } else {
      ctx.throw(400, "Kindly submit the image");
    }
    return sanitizeEntity(entity, { model: strapi.models.pet });
  },
  async update(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.pet.update({ id, user: user.id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.pet.update(
        {
          id,
          user: user.id,
        },
        ctx.request.body
      );
    }
    return sanitizeEntity(entity, { model: strapi.models.pet });
  },
  async delete(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;
    const entity = await strapi.services.pet.delete({
      id,
      user: user.id,
    });
    if (entity) {
      const { id } = entity.image;
      const file = await strapi.plugins["upload"].services.upload.fetch({ id });
      await strapi.plugins["upload"].services.upload.remove(file);
    }
    return sanitizeEntity(entity, { model: strapi.models.restaurant });
  },
};
