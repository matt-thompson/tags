# Tags Framework

> The Tags framework lets you build View objects from standard HTML and
  custom tags using XML or Javascript. This makes 
  it easy to bind event handlers to DOM elements, manipulate static and dynamic 
  HTML and implement application specific custom tags and general purpose widget 
  libraries using a convenient HTML interface.
  
> See the [Introduction](../introduction.html) to find out how to use the Tags framework.
  
> Functionality is implemented in two Javascript source files.

 * tags.js - This is the Core functionality and it contains the {@link Tags} namespace and the {@link View} class.
 * boxlib.js - This implements {@link module:boxlib} which is a set of custom tags for doing layout. 
               This file is not required unless the layout feature is to be used.

## Tags Namespace

> The {@link Tags} Namespace is used to define Tag classes and instantiate Tag objects.

## View Class
> The {@link View} class is a Tag class that represents HTML. An instance
 of the View class has a tag attribute that matches an HTML element and
 can have nested structure that matches the corresponding HTML. View 
 objects can be associated with existing static HTML or used to render
 dynamic HTML. The View class can be extended to implement custom
 tags that work like standard HTML tags.

