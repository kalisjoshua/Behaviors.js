Contributing
============

Contributions are welcome.

If you are writing a new behavioral library, please keep in mind the design goals of the project. Each library should:

* Follow the principle of progressive enhancement
* Be configurable via pure HTML
* Have no dependencies
* Work with elements that are created dynamically (i.e. *after* page load)

Tests
-----

We use Jasmine for unit testing. To verify that all tests are passing, open `tests/SpecRunner.html` in a browser. If you are adding any non-trivial logic, please cover it with additional test cases.

Code Style
----------

We follow a set of ESLint and JSHint rules. You can check whether there are any issues by running the following command:

    npm run lint

(Alternatively, you can use `linter`, `linter-jslint` and `linter-jshint` packages in Atom editor.)
