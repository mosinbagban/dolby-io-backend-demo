module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      appname: String,
      description: String,
      themecolor:String,
      published: Boolean
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Tutorial = mongoose.model("appbuilder", schema);
  return Tutorial;
};
