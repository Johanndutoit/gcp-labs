# Copyright 2016 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import webapp2


class MainPage(webapp2.RequestHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'text/plain'
    
    # check if the name was given
    if self.request.get('name') != None and self.request.get('name') != '':

      # print the name
      self.response.write('Hello ' + str(self.request.get('name')) + '!')

    else:

      # just respond with a sample out
      self.response.write('Hello App Engine Standard! Add a ?name= query string parameter to get a greeting')


app = webapp2.WSGIApplication([
  
  ('/', MainPage),

], debug=True)
