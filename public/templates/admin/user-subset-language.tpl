<textarea class="form-control" rows="6" name="text" placeholder="Enter Text / Markdown"></textarea>

<hr />

<div class="form-group">
	<label>Select Language(s)</label>
	<select name="language" class="form-control" multiple="multiple">
		<!-- BEGIN languages -->
		<option value="{../code}">{../name}</option>
		<!-- END languages -->
	</select>
	<p class="help-block">
		Shift-click to select a range, ctrl-click to select/de-select multiple items
	</p>
</div>

<hr />

<div class="checkbox">
	<label>
		<input type="checkbox" name="parseAsPost" checked />
		Parse as a Post? (Take all post-related plugins into effect)
	</label>
</div>