import { Route, Switch } from "wouter";
import WelcomePage from "./pages/welcome";
import CreateUserPage from "./pages/create-user";
import SelectionPage from "./pages/selection"; // ← DAS war bisher bei dir vermutlich falsch
import VocabularyPage from "./pages/vocabulary";
import GapFillPage from "./pages/gap-fill";
import SuccessPage from "./pages/success";
import ParentAreaPage from "./pages/parent-area";
import NotFoundPage from "./pages/not-found";

export default function Routes() {
  return (
    <Switch>
      <Route path="/" component={WelcomePage} />
      <Route path="/create-user" component={CreateUserPage} />
      <Route path="/selection" component={SelectionPage} />
      <Route path="/vocabulary/:topic" component={VocabularyPage} />
      <Route path="/gap-fill/:topic" component={GapFillPage} />
      <Route path="/success/:topic" component={SuccessPage} />
      <Route path="/parent" component={ParentAreaPage} />
      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}
