import { User } from './User.models.js';
import { Profile } from './Profiles.models.js';
import { Article } from "./Atricle.models.js";
import { Tag } from './Tag.models.js';
import { ArticleTag } from './ArticleTag.medels.js';

User.hasOne(Profile, {
  foreignKey: 'user_id',
  as: 'profile',
  onDelete: 'CASCADE',
});
Profile.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(Article, {
  foreignKey: 'user_id',
  as: 'articles',
  onDelete: 'CASCADE',
});
Article.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author',
});

Article.hasMany(ArticleTag, {
  foreignKey: 'article_id',
  as: 'articleTags',
  onDelete: 'CASCADE',
});
Tag.hasMany(ArticleTag, {
  foreignKey: 'tag_id',
  as: 'tagArticles',
  onDelete: 'CASCADE',
});

Article.belongsToMany(Tag, {
  through: ArticleTag,
  foreignKey: 'article_id',
  otherKey: 'tag_id',
  as: 'tags',
});
Tag.belongsToMany(Article, {
  through: ArticleTag,
  foreignKey: 'tag_id',
  otherKey: 'article_id',
  as: 'articles',
});

export { User, Profile, Article, Tag, ArticleTag };
